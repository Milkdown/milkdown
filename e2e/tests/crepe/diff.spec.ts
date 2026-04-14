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

  test('clear diff keeps the original document', async ({ page }) => {
    await applyDiff(page, original, modified)

    await page.evaluate(() => window.__clearDiff__())
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

  test('deleted heading is marked as removed', async ({ page }) => {
    await applyDiff(
      page,
      '# First\n\n## Second\n\nParagraph.',
      '# First\n\nParagraph.'
    )

    // Deleting a whole heading is a block-level removal.
    const editor = page.locator('.editor')
    const removed = editor.locator(
      '.milkdown-diff-removed, .milkdown-diff-removed-block'
    )
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

  test('cross-boundary change splits into inline and block segments', async ({
    page,
  }) => {
    // Edit at the end of a paragraph AND add a following paragraph in one diff.
    // Expect both an inline change (' extra') and a block-level added widget
    // containing the new paragraph.
    await applyDiff(
      page,
      '# Heading\n\nFirst paragraph.',
      '# Heading\n\nFirst paragraph. extra\n\nSecond paragraph.'
    )

    const editor = page.locator('.editor')
    const addedInline = editor.locator(
      '.milkdown-diff-added:not(.milkdown-diff-added-block)'
    )
    const addedBlock = editor.locator('.milkdown-diff-added-block')

    await expect(addedInline.first()).toBeVisible()
    await expect(addedBlock.first()).toBeVisible()

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('First paragraph. extra')
    expect(markdown).toContain('Second paragraph.')
  })

  test('within-block edit in list item renders as inline', async ({ page }) => {
    // Text edit inside a list item paragraph — the old-doc slice contains
    // sub-block nodes (list_item) but the edit itself is inline.
    // Should render with inline decorations, not block-level widgets.
    await applyDiff(page, '- Item one\n- Item two', '- Item ONE\n- Item two')

    const editor = page.locator('.editor')
    const addedInline = editor.locator(
      '.milkdown-diff-added:not(.milkdown-diff-added-block)'
    )
    const removedInline = editor.locator(
      '.milkdown-diff-removed:not(.milkdown-diff-removed-block)'
    )

    await expect(addedInline.first()).toBeVisible()
    await expect(removedInline.first()).toBeVisible()

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Item ONE')
    expect(markdown).toContain('Item two')
  })

  test('within-block edit in blockquote renders as inline', async ({
    page,
  }) => {
    await applyDiff(page, '> Quote text\n\nAfter.', '> Quote CHANGED\n\nAfter.')

    const editor = page.locator('.editor')
    const addedInline = editor.locator(
      '.milkdown-diff-added:not(.milkdown-diff-added-block)'
    )

    await expect(addedInline.first()).toBeVisible()

    await page.evaluate(() => window.__acceptAll__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Quote CHANGED')
    expect(markdown).toContain('After.')
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

test.describe('regression: sequential operations', () => {
  test('editor unlocks after accepting all changes one by one', async ({
    page,
  }) => {
    await applyDiff(page, '# Hello\n\nFirst.', '# World\n\nSecond.')

    const editor = page.locator('.editor')

    // Accept changes one by one until none remain
    let controls = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()
    while (controls > 0) {
      await page.evaluate(() => window.__acceptChunk__(0))
      await waitNextFrame(page)
      controls = await editor
        .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
        .count()
    }

    // Editor should be unlocked — typing should work
    await editor.click()
    await page.keyboard.type('UNLOCKED')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('UNLOCKED')
  })

  test('editor unlocks after rejecting all changes one by one', async ({
    page,
  }) => {
    await applyDiff(page, '# Hello\n\nFirst.', '# World\n\nSecond.')

    const editor = page.locator('.editor')

    // Reject changes one by one until none remain
    let controls = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()
    while (controls > 0) {
      await page.evaluate(() => window.__rejectChunk__(0))
      await waitNextFrame(page)
      controls = await editor
        .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
        .count()
    }

    // Editor should be unlocked
    await editor.click()
    await page.keyboard.type('UNLOCKED')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('UNLOCKED')
  })

  test('sequential reject works for all changes (no index drift)', async ({
    page,
  }) => {
    await applyDiff(
      page,
      '- Item 1\n- Item 2\n- Item 3',
      '- Item A\n- Item B\n- Item C\n- Item D'
    )

    const editor = page.locator('.editor')
    const initialControls = await editor
      .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
      .count()
    expect(initialControls).toBeGreaterThan(0)

    // Reject all one by one — each should succeed
    for (let i = 0; i < initialControls; i++) {
      const before = await editor
        .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
        .count()
      if (before === 0) break

      await page.evaluate(() => window.__rejectChunk__(0))
      await waitNextFrame(page)

      const after = await editor
        .locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
        .count()
      expect(after).toBeLessThan(before)
    }

    // All should be resolved
    await expect(
      editor.locator('.milkdown-diff-controls, .milkdown-diff-controls-block')
    ).toHaveCount(0)

    // Original content preserved
    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Item 1')
    expect(markdown).not.toContain('Item A')
  })
})
