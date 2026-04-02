import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { focusEditor, loadFixture, setMarkdown } from '../misc'

const TEST_TEARDOWN_DELAY = 300
const TEARDOWN_BUFFER = 500

async function setTeardownDelay(page: Page, delay = TEST_TEARDOWN_DELAY) {
  await page.evaluate((d) => {
    const mod = window.__CodeMirrorBlock__
    if (mod) mod.TEARDOWN_DELAY = d
  }, delay)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
  const markdown = await loadFixture('many-code-blocks.md')
  await focusEditor(page)
  await setMarkdown(page, markdown)
})

test.describe('code block lazy initialization', () => {
  test('should render placeholder for off-screen code blocks', async ({
    page,
  }) => {
    const codeBlocks = page.locator('.milkdown-code-block')
    await expect(codeBlocks).toHaveCount(25)

    // Visible code blocks should have CodeMirror initialized (no placeholder)
    const firstBlock = codeBlocks.nth(0)
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()
    await expect(
      firstBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(0)

    // Off-screen code blocks should still have placeholders
    const lastBlock = codeBlocks.nth(24)
    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)
    await expect(lastBlock.locator('.cm-editor')).toHaveCount(0)
  })

  test('should initialize CodeMirror when scrolled into view', async ({
    page,
  }) => {
    const codeBlocks = page.locator('.milkdown-code-block')
    const lastBlock = codeBlocks.nth(24)

    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)

    await lastBlock.scrollIntoViewIfNeeded()

    await expect(lastBlock.locator('.cm-editor')).toBeVisible()
    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(0)
  })

  test('should initialize CodeMirror on click', async ({ page }) => {
    const codeBlocks = page.locator('.milkdown-code-block')
    const lastBlock = codeBlocks.nth(24)

    await lastBlock.scrollIntoViewIfNeeded()
    await expect(lastBlock.locator('.cm-editor')).toBeVisible()

    const cmContent = lastBlock.locator('.cm-content')
    await cmContent.click()
    await page.keyboard.type(' // edited')

    await expect(cmContent).toContainText('// edited')
  })

  test('should preserve content when lazily initialized', async ({ page }) => {
    const codeBlocks = page.locator('.milkdown-code-block')

    const block20 = codeBlocks.nth(19)
    const placeholder = block20.locator('.milkdown-code-block-placeholder code')
    await expect(placeholder).toHaveText("const block20 = 'twentieth'")

    await block20.scrollIntoViewIfNeeded()
    await expect(block20.locator('.cm-editor')).toBeVisible()
    const cmContent = block20.locator('.cm-content')
    await expect(cmContent).toContainText("const block20 = 'twentieth'")
  })

  test('should serialize all code blocks correctly including lazy ones', async ({
    page,
  }) => {
    const output = await page.evaluate(() => window.__getMarkdown__())
    expect(output).toContain("const block1 = 'first'")
    expect(output).toContain("const block25 = 'twenty-fifth'")

    const codeBlockCount = (output.match(/```ts/g) || []).length
    expect(codeBlockCount).toBe(25)
  })

  test('should not create excessive CodeMirror instances on load', async ({
    page,
  }) => {
    const cmEditorCount = await page.locator('.cm-editor').count()
    expect(cmEditorCount).toBeLessThan(15)
  })

  test('should tear down CodeMirror when scrolled away', async ({ page }) => {
    await setTeardownDelay(page)

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    const lastBlock = codeBlocks.nth(24)
    await lastBlock.scrollIntoViewIfNeeded()
    await expect(lastBlock.locator('.cm-editor')).toBeVisible()

    await page.waitForTimeout(TEST_TEARDOWN_DELAY + TEARDOWN_BUFFER)

    await expect(firstBlock.locator('.cm-editor')).toHaveCount(0)
    await expect(
      firstBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)
  })

  test('should re-initialize CodeMirror when scrolled back', async ({
    page,
  }) => {
    await setTeardownDelay(page)

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    await codeBlocks.nth(24).scrollIntoViewIfNeeded()
    await page.waitForTimeout(TEST_TEARDOWN_DELAY + TEARDOWN_BUFFER)
    await expect(firstBlock.locator('.cm-editor')).toHaveCount(0)

    await firstBlock.scrollIntoViewIfNeeded()
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()
    await expect(
      firstBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(0)

    const cmContent = firstBlock.locator('.cm-content')
    await expect(cmContent).toContainText("const block1 = 'first'")
  })

  test('should not tear down focused code block', async ({ page }) => {
    await setTeardownDelay(page)

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    await firstBlock.locator('.cm-content').click()

    await page.evaluate(() => {
      window.scrollBy(0, 99999)
    })
    await page.waitForTimeout(TEST_TEARDOWN_DELAY + TEARDOWN_BUFFER)

    await expect(firstBlock.locator('.cm-editor')).toHaveCount(1)
  })

  test('should cancel teardown if scrolled back quickly', async ({ page }) => {
    const longDelay = 2000
    await setTeardownDelay(page, longDelay)

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    await codeBlocks.nth(24).scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)

    await firstBlock.scrollIntoViewIfNeeded()
    await page.waitForTimeout(longDelay + TEARDOWN_BUFFER)

    await expect(firstBlock.locator('.cm-editor')).toBeVisible()
  })
})
