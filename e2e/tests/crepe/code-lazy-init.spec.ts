import { expect, test } from '@playwright/test'

import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test.describe('code block lazy initialization', () => {
  test('should render placeholder for off-screen code blocks', async ({
    page,
  }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

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
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    const codeBlocks = page.locator('.milkdown-code-block')
    const lastBlock = codeBlocks.nth(24)

    // Verify the last block has a placeholder before scrolling
    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)

    // Scroll the last block into view
    await lastBlock.scrollIntoViewIfNeeded()

    // After scrolling, CodeMirror should be initialized
    await expect(lastBlock.locator('.cm-editor')).toBeVisible()
    await expect(
      lastBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(0)
  })

  test('should initialize CodeMirror on click', async ({ page }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    const codeBlocks = page.locator('.milkdown-code-block')
    const lastBlock = codeBlocks.nth(24)

    // Scroll to last block and click it
    await lastBlock.scrollIntoViewIfNeeded()
    await expect(lastBlock.locator('.cm-editor')).toBeVisible()

    // Should be able to interact with the CodeMirror editor
    const cmContent = lastBlock.locator('.cm-content')
    await cmContent.click()
    await page.keyboard.type(' // edited')

    // Verify the text was updated
    await expect(cmContent).toContainText('// edited')
  })

  test('should preserve content when lazily initialized', async ({ page }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    const codeBlocks = page.locator('.milkdown-code-block')

    // Check that the placeholder shows the correct content
    const block20 = codeBlocks.nth(19)
    const placeholder = block20.locator('.milkdown-code-block-placeholder code')
    await expect(placeholder).toHaveText("const block20 = 'twentieth'")

    // Scroll into view and verify CodeMirror has the same content
    await block20.scrollIntoViewIfNeeded()
    await expect(block20.locator('.cm-editor')).toBeVisible()
    const cmContent = block20.locator('.cm-content')
    await expect(cmContent).toContainText("const block20 = 'twentieth'")
  })

  test('should serialize all code blocks correctly including lazy ones', async ({
    page,
  }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    // Get markdown output - all blocks should serialize correctly
    // even if some have not been initialized
    const output = await page.evaluate(() => window.__getMarkdown__())
    expect(output).toContain("const block1 = 'first'")
    expect(output).toContain("const block25 = 'twenty-fifth'")

    // Count code blocks in output
    const codeBlockCount = (output.match(/```ts/g) || []).length
    expect(codeBlockCount).toBe(25)
  })

  test('should not create excessive CodeMirror instances on load', async ({
    page,
  }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    // Count initialized CodeMirror editors - should be much less than 25
    const cmEditorCount = await page.locator('.cm-editor').count()
    expect(cmEditorCount).toBeLessThan(15)
  })

  test('should tear down CodeMirror when scrolled away', async ({ page }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    // Use a short teardown delay for testing
    await page.evaluate(() => {
      const mod = window.__CodeMirrorBlock__
      if (mod) mod.TEARDOWN_DELAY = 300
    })

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    // First block should be initialized
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    // Scroll to the bottom so first block is off-screen
    const lastBlock = codeBlocks.nth(24)
    await lastBlock.scrollIntoViewIfNeeded()
    await expect(lastBlock.locator('.cm-editor')).toBeVisible()

    // Wait for teardown delay + buffer
    await page.waitForTimeout(800)

    // First block should now have placeholder instead of CodeMirror
    await expect(firstBlock.locator('.cm-editor')).toHaveCount(0)
    await expect(
      firstBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(1)
  })

  test('should re-initialize CodeMirror when scrolled back', async ({
    page,
  }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    await page.evaluate(() => {
      const mod = window.__CodeMirrorBlock__
      if (mod) mod.TEARDOWN_DELAY = 300
    })

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    // First block starts initialized
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    // Scroll away
    await codeBlocks.nth(24).scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await expect(firstBlock.locator('.cm-editor')).toHaveCount(0)

    // Scroll back
    await firstBlock.scrollIntoViewIfNeeded()
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()
    await expect(
      firstBlock.locator('.milkdown-code-block-placeholder')
    ).toHaveCount(0)

    // Content should be preserved
    const cmContent = firstBlock.locator('.cm-content')
    await expect(cmContent).toContainText("const block1 = 'first'")
  })

  test('should not tear down focused code block', async ({ page }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    await page.evaluate(() => {
      const mod = window.__CodeMirrorBlock__
      if (mod) mod.TEARDOWN_DELAY = 300
    })

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    // Focus the first code block's CodeMirror editor
    await firstBlock.locator('.cm-content').click()

    // Scroll away while it's focused
    await page.evaluate(() => {
      window.scrollBy(0, 99999)
    })
    await page.waitForTimeout(800)

    // Should NOT be torn down because it has focus
    await expect(firstBlock.locator('.cm-editor')).toHaveCount(1)
  })

  test('should cancel teardown if scrolled back quickly', async ({ page }) => {
    const markdown = await loadFixture('many-code-blocks.md')
    await focusEditor(page)
    await setMarkdown(page, markdown)

    await page.evaluate(() => {
      const mod = window.__CodeMirrorBlock__
      if (mod) mod.TEARDOWN_DELAY = 2000
    })

    const codeBlocks = page.locator('.milkdown-code-block')
    const firstBlock = codeBlocks.nth(0)

    await expect(firstBlock.locator('.cm-editor')).toBeVisible()

    // Scroll away briefly
    await codeBlocks.nth(24).scrollIntoViewIfNeeded()
    await page.waitForTimeout(200) // well within teardown delay

    // Scroll back before teardown fires
    await firstBlock.scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)

    // Should still be initialized (teardown was cancelled)
    await expect(firstBlock.locator('.cm-editor')).toBeVisible()
  })
})
