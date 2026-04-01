import { expect, test, type Page } from '@playwright/test'

import { getMarkdown, setMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe-diff/')
})

async function applyDiff(page: Page, original: string, modified: string) {
  await setMarkdown(page, original)
  await waitNextFrame(page)
  await page.evaluate((md: string) => window.__applyDiff__(md), modified)
  await waitNextFrame(page)
}

test.describe('diff commands', () => {
  const original = `# Hello World\n\nFirst paragraph.`
  const modified = `# Hello Milkdown\n\nUpdated paragraph.`

  test('accept all applies the new document', async ({ page }) => {
    await applyDiff(page, original, modified)

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Hello Milkdown')
    expect(markdown).not.toContain('Hello World')
  })

  test('reject all keeps the original document', async ({ page }) => {
    await applyDiff(page, original, modified)

    await page.evaluate(() => window.__rejectAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Hello World')
    expect(markdown).not.toContain('Hello Milkdown')
  })

  test('clear diff removes all decorations', async ({ page }) => {
    await applyDiff(page, original, modified)

    const editor = page.locator('.editor')
    await expect(editor.locator('.milkdown-diff-added').first()).toBeVisible()

    await page.evaluate(() => window.__clearDiff__())
    await waitNextFrame(page)

    await expect(editor.locator('.milkdown-diff-added')).toHaveCount(0)
    await expect(editor.locator('.milkdown-diff-controls')).toHaveCount(0)
  })

  test('accept chunk reduces pending changes', async ({ page }) => {
    await applyDiff(page, original, modified)

    const editor = page.locator('.editor')
    const before = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()

    await page.evaluate(() => window.__acceptChunk__(0))
    await waitNextFrame(page)

    const after = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()
    expect(after).toBeLessThan(before)
  })

  test('reject chunk reduces pending changes', async ({ page }) => {
    await applyDiff(page, original, modified)

    const editor = page.locator('.editor')
    const before = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()

    await page.evaluate(() => window.__rejectChunk__(0))
    await waitNextFrame(page)

    const after = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()
    expect(after).toBeLessThan(before)
  })

  test('lock on review prevents document editing', async ({ page }) => {
    await applyDiff(page, original, modified)

    const editor = page.locator('.editor')
    await editor.click()
    await page.keyboard.type('SHOULD NOT APPEAR')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).not.toContain('SHOULD NOT APPEAR')
  })
})

test.describe('inline diff', () => {
  test('text change within a paragraph shows inline decorations', async ({
    page,
  }) => {
    await applyDiff(
      page,
      'Hello world, this is a test.',
      'Hello milkdown, this is a test.'
    )

    const editor = page.locator('.editor')
    const removed = editor.locator('.milkdown-diff-removed')
    const added = editor.locator('.milkdown-diff-added')
    await expect(removed.first()).toBeVisible()
    await expect(added.first()).toBeVisible()
  })

  test('format change with text difference shows diff', async ({ page }) => {
    await applyDiff(
      page,
      'This is **bold** and normal text.',
      'This is **bold** and *italic* text.'
    )

    const editor = page.locator('.editor')
    const added = editor.locator('.milkdown-diff-added')
    await expect(added.first()).toBeVisible()

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('*italic*')
  })

  test('accept inline diff updates the text', async ({ page }) => {
    await applyDiff(page, 'Hello world.', 'Hello milkdown.')

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('milkdown')
    expect(markdown).not.toContain('world')
  })
})

test.describe('block diff', () => {
  test('new paragraph shows as block insertion', async ({ page }) => {
    await applyDiff(
      page,
      '# Heading\n\nFirst paragraph.',
      '# Heading\n\nFirst paragraph.\n\nSecond paragraph.'
    )

    const editor = page.locator('.editor')
    const addedBlock = editor.locator('.milkdown-diff-added-block')
    await expect(addedBlock.first()).toBeVisible()
  })

  test('deleted heading shows strikethrough', async ({ page }) => {
    await applyDiff(
      page,
      '# First\n\n## Second\n\nParagraph.',
      '# First\n\nParagraph.'
    )

    const editor = page.locator('.editor')
    const removed = editor.locator('.milkdown-diff-removed')
    await expect(removed.first()).toBeVisible()
  })

  test('new list item shows as block insertion', async ({ page }) => {
    await applyDiff(page, '- Item 1\n- Item 2', '- Item 1\n- Item 2\n- Item 3')

    const editor = page.locator('.editor')
    const addedBlock = editor.locator('.milkdown-diff-added-block')
    await expect(addedBlock.first()).toBeVisible()

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Item 3')
  })
})

test.describe('image diff', () => {
  test('image src change shows new image widget and marks old as removed', async ({
    page,
  }) => {
    await applyDiff(page, '![]()', '![1.0](https://example.com/new.png)')

    const editor = page.locator('.editor')
    // Old image-block should have removed-block decoration
    const removedBlock = editor.locator('.milkdown-diff-removed-block')
    await expect(removedBlock.first()).toBeVisible()

    // New image should appear in the added widget
    const addedBlock = editor.locator('.milkdown-diff-added-block')
    await expect(addedBlock.first()).toBeVisible()
  })

  test('accept image diff updates the document', async ({ page }) => {
    await applyDiff(page, '![]()', '![1.0](https://example.com/new.png)')

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('example.com/new.png')
  })
})

test.describe('table diff', () => {
  test('table with new column shows as block replacement', async ({ page }) => {
    await applyDiff(
      page,
      '| A | B |\n| - | - |\n| 1 | 2 |',
      '| A | B | C |\n| - | - | - |\n| 1 | 2 | 3 |'
    )

    const editor = page.locator('.editor')
    // Old table should be marked as removed block
    const removedBlock = editor.locator('.milkdown-diff-removed-block')
    await expect(removedBlock.first()).toBeVisible()

    // New table should appear in the added widget
    const addedBlock = editor.locator('.milkdown-diff-added-block')
    await expect(addedBlock.first()).toBeVisible()
  })

  test('table with new row shows as block replacement', async ({ page }) => {
    await applyDiff(
      page,
      '| A | B |\n| - | - |\n| 1 | 2 |',
      '| A | B |\n| - | - |\n| 1 | 2 |\n| 3 | 4 |'
    )

    const editor = page.locator('.editor')
    const addedBlock = editor.locator('.milkdown-diff-added-block')
    await expect(addedBlock.first()).toBeVisible()
  })

  test('accept table diff updates to new table', async ({ page }) => {
    await applyDiff(
      page,
      '| A | B |\n| - | - |\n| 1 | 2 |',
      '| A | B | C |\n| - | - | - |\n| 1 | 2 | 3 |'
    )

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('C')
    expect(markdown).toContain('3')
  })
})
