import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { focusEditor, loadFixture, setMarkdown } from '../misc'

const TEST_TEARDOWN_DELAY = 300
const TEARDOWN_BUFFER = 500
const THEME_CLASS = /\btest-theme\b/

// A theme that only marks `.cm-editor` with a class, so the test can see
// which code blocks picked it up.
async function setTheme(page: Page, enabled: boolean) {
  await page.evaluate((enabled) => {
    const theme = enabled
      ? window.__CodeMirrorEditorView__.editorAttributes.of({
          class: 'test-theme',
        })
      : []
    window.__crepe__.editor.action(window.__setCodeMirrorTheme__(theme))
  }, enabled)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
  const markdown = await loadFixture('many-code-blocks.md')
  await focusEditor(page)
  await setMarkdown(page, markdown)
})

test.describe('code block theme', () => {
  test('should switch the theme of rendered code blocks', async ({ page }) => {
    const editor = page
      .locator('.milkdown-code-block')
      .nth(0)
      .locator('.cm-editor')
    await expect(editor).toBeVisible()
    await expect(editor).not.toHaveClass(THEME_CLASS)

    await setTheme(page, true)
    await expect(editor).toHaveClass(THEME_CLASS)

    await setTheme(page, false)
    await expect(editor).not.toHaveClass(THEME_CLASS)
  })

  test('should apply the theme to lazily initialized code blocks', async ({
    page,
  }) => {
    const lastBlock = page.locator('.milkdown-code-block').nth(24)
    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)

    await setTheme(page, true)
    await lastBlock.scrollIntoViewIfNeeded()

    await expect(lastBlock.locator('.cm-editor')).toHaveClass(THEME_CLASS)
  })

  test('should keep the theme after a code block is torn down', async ({
    page,
  }) => {
    await page.evaluate((delay) => {
      window.__CodeMirrorBlock__.TEARDOWN_DELAY = delay
    }, TEST_TEARDOWN_DELAY)

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    await setTheme(page, true)

    await codeBlocks.nth(24).scrollIntoViewIfNeeded()
    await page.waitForTimeout(TEST_TEARDOWN_DELAY + TEARDOWN_BUFFER)
    await expect(firstBlock.locator('.cm-editor')).toHaveCount(0)

    await firstBlock.scrollIntoViewIfNeeded()
    await expect(firstBlock.locator('.cm-editor')).toHaveClass(THEME_CLASS)
  })

  test('should apply the theme to new code blocks', async ({ page }) => {
    await setTheme(page, true)
    await setMarkdown(page, '```ts\nconst a = 1\n```\n')

    await expect(page.locator('.cm-editor')).toHaveClass(THEME_CLASS)
  })
})

test.describe('code block colors', () => {
  test('should let the theme paint the editor and the gutters', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const theme = window.__CodeMirrorEditorView__.theme({
        '&': { backgroundColor: 'rgb(1, 2, 3)' },
        '.cm-gutters': { backgroundColor: 'rgb(4, 5, 6)' },
      })
      window.__crepe__.editor.action(window.__setCodeMirrorTheme__(theme))
    })

    const block = page.locator('.milkdown-code-block').nth(0)
    await expect(block.locator('.cm-editor')).toHaveCSS(
      'background-color',
      'rgb(1, 2, 3)'
    )
    await expect(block.locator('.cm-gutters')).toHaveCSS(
      'background-color',
      'rgb(4, 5, 6)'
    )
  })

  test('should use the surface color without a theme', async ({ page }) => {
    await setTheme(page, false)

    const block = page.locator('.milkdown-code-block').nth(0)
    const surface = await block.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )
    await expect(block.locator('.cm-editor')).toHaveCSS(
      'background-color',
      surface
    )
    const gutters = block.locator('.cm-gutters')
    await expect(gutters).toHaveCSS('background-color', surface)
    await expect(gutters).toHaveCSS('border-right-width', '0px')

    await block.locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+f')
    await expect(block.locator('.cm-panels')).toHaveCSS(
      'background-color',
      surface
    )
  })

  test('should let a lowest-precedence theme override the surface color', async ({
    page,
  }) => {
    await page.evaluate(() => {
      // `baseTheme` styles have the lowest precedence.
      const theme = window.__CodeMirrorEditorView__.baseTheme({
        '&light .cm-gutters': { backgroundColor: 'rgb(7, 8, 9)' },
      })
      window.__crepe__.editor.action(window.__setCodeMirrorTheme__(theme))
    })

    const block = page.locator('.milkdown-code-block').nth(0)
    await expect(block.locator('.cm-gutters')).toHaveCSS(
      'background-color',
      'rgb(7, 8, 9)'
    )
  })

  test('should not use the surface color for a dark theme', async ({
    page,
  }) => {
    await page.evaluate(() => {
      const theme = window.__CodeMirrorEditorView__.theme(
        { '&': { backgroundColor: 'rgb(1, 2, 3)' } },
        { dark: true }
      )
      window.__crepe__.editor.action(window.__setCodeMirrorTheme__(theme))
    })

    const block = page.locator('.milkdown-code-block').nth(0)
    const surface = await block.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    )
    await expect(block.locator('.cm-editor')).toHaveCSS(
      'background-color',
      'rgb(1, 2, 3)'
    )
    await expect(block.locator('.cm-gutters')).not.toHaveCSS(
      'background-color',
      surface
    )
  })
})
