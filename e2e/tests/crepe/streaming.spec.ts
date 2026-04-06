import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { getMarkdown, setMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe-streaming/')
})

async function simulateStream(
  page: Page,
  tokens: string[],
  options?: { delayMs?: number; insertAt?: 'cursor' | number }
) {
  const delayMs = options?.delayMs ?? 30
  const insertAt = options?.insertAt
  await page.evaluate(
    (pos) =>
      window.__startStreaming__(pos != null ? { insertAt: pos } : undefined),
    insertAt
  )
  await waitNextFrame(page)

  for (const token of tokens) {
    await page.evaluate((t) => window.__pushChunk__(t), token)
    if (delayMs > 0) await page.waitForTimeout(delayMs)
  }
}

/// Wait for the streaming flush to apply by checking that the editor
/// contains the expected text. Uses Playwright's auto-retry instead of
/// a fixed timeout.
async function waitForFlush(page: Page, expectedText: string) {
  const editor = page.locator('.editor')
  await expect(editor).toContainText(expectedText, { timeout: 2000 })
}

test.describe('streaming basics', () => {
  test('streaming renders content progressively', async ({ page }) => {
    await simulateStream(page, ['# Hello', '\n\n', 'World'])
    await waitForFlush(page, 'World')

    const editor = page.locator('.editor')
    await expect(editor.locator('h1')).toContainText('Hello')
    await expect(editor.locator('p').first()).toContainText('World')
  })

  test('endStreaming finalizes content', async ({ page }) => {
    await simulateStream(page, ['# Title', '\n\n', 'Paragraph.'])
    await waitForFlush(page, 'Paragraph.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('# Title')
    expect(markdown).toContain('Paragraph.')
  })

  test('editor is locked during streaming', async ({ page }) => {
    await setMarkdown(page, 'Original content.')
    await waitNextFrame(page)

    await page.evaluate(() => window.__startStreaming__())
    await waitNextFrame(page)

    // Try typing while streaming
    const editor = page.locator('.editor')
    await editor.click()
    await page.keyboard.type('SHOULD NOT APPEAR')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).not.toContain('SHOULD NOT APPEAR')
  })

  test('editor unlocks after endStreaming', async ({ page }) => {
    await simulateStream(page, ['Hello'])
    await waitForFlush(page, 'Hello')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    await editor.click()
    await page.keyboard.type(' UNLOCKED')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('UNLOCKED')
  })
})

test.describe('streaming abort', () => {
  test('abort with keep=false restores original document', async ({ page }) => {
    await setMarkdown(page, 'Original content.')
    await waitNextFrame(page)

    await simulateStream(page, ['# Replaced', '\n\n', 'New stuff.'])
    await waitForFlush(page, 'New stuff.')

    await page.evaluate(() => window.__abortStreaming__({ keep: false }))
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Original content')
    expect(markdown).not.toContain('Replaced')
  })

  test('abort with keep=true preserves partial content', async ({ page }) => {
    await simulateStream(page, ['# Partial', '\n\n', 'Content.'])
    await waitForFlush(page, 'Content.')

    await page.evaluate(() => window.__abortStreaming__({ keep: true }))
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Partial')
  })

  test('editor unlocks after abort', async ({ page }) => {
    await page.evaluate(() => window.__startStreaming__())
    await waitNextFrame(page)

    await page.evaluate(() => window.__abortStreaming__({ keep: false }))
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    await editor.click()
    await page.keyboard.type('UNLOCKED')
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('UNLOCKED')
  })
})

test.describe('streaming with multiple blocks', () => {
  test('renders heading, paragraph, and list', async ({ page }) => {
    const tokens = [
      '# My Title',
      '\n\n',
      'A paragraph of text.',
      '\n\n',
      '- Item 1',
      '\n',
      '- Item 2',
      '\n',
      '- Item 3',
    ]
    await simulateStream(page, tokens)
    await waitForFlush(page, 'Item 3')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('# My Title')
    expect(markdown).toContain('A paragraph of text.')
    expect(markdown).toContain('Item 1')
    expect(markdown).toContain('Item 3')
  })

  test('renders code block streamed token by token', async ({ page }) => {
    const tokens = [
      '```',
      'typescript',
      '\n',
      'const ',
      'x ',
      '= ',
      '1',
      '\n',
      '```',
    ]
    await simulateStream(page, tokens)
    await waitForFlush(page, 'const')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('const x = 1')
  })
})

test.describe('insert-at-cursor', () => {
  test('insert at cursor preserving surrounding content', async ({ page }) => {
    await setMarkdown(page, 'Before.\n\nAfter.')
    await waitNextFrame(page)

    // Click at the end of "Before." paragraph to place cursor
    const editor = page.locator('.editor')
    await editor.locator('p').first().click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    await simulateStream(page, ['Inserted text.'], { insertAt: 'cursor' })
    await waitForFlush(page, 'Inserted text.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Before.')
    expect(markdown).toContain('Inserted text.')
    expect(markdown).toContain('After.')
  })

  test('insert at cursor replaces empty paragraph with blocks', async ({
    page,
  }) => {
    // Empty editor has a single empty paragraph — streaming should replace it
    const editor = page.locator('.editor')
    await editor.locator('p').first().click()
    await waitNextFrame(page)

    await simulateStream(
      page,
      ['# Hello\n\nA paragraph.\n\n- Item 1\n- Item 2'],
      { insertAt: 'cursor' }
    )
    await waitForFlush(page, 'Item 2')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('# Hello')
    expect(markdown).toContain('A paragraph.')
    expect(markdown).toContain('Item 1')
    expect(markdown).toContain('Item 2')
  })

  test('insert at end of document', async ({ page }) => {
    await setMarkdown(page, 'Existing content.')
    await waitNextFrame(page)

    // Move cursor to end of document
    const editor = page.locator('.editor')
    await editor.locator('p').last().click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    await simulateStream(page, ['## Appended'], {
      insertAt: 'cursor',
    })
    await waitForFlush(page, 'Appended')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Existing content.')
    expect(markdown).toContain('Appended')
  })

  test('abort insert mode restores original', async ({ page }) => {
    await setMarkdown(page, 'Original only.')
    await waitNextFrame(page)

    // Click at end of paragraph to place cursor
    const editor = page.locator('.editor')
    await editor.locator('p').first().click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    await simulateStream(page, ['Inserted stuff.'], { insertAt: 'cursor' })
    await waitForFlush(page, 'Inserted stuff.')

    await page.evaluate(() => window.__abortStreaming__({ keep: false }))
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Original only.')
    expect(markdown).not.toContain('Inserted stuff')
  })

  test('insert after code block preserves code', async ({ page }) => {
    await setMarkdown(page, '```typescript\nconst x = 1\n```\n\nEnd.')
    await waitNextFrame(page)

    // Click at the end to place cursor after code block
    const editor = page.locator('.editor')
    const endP = editor.locator('p').last()
    await endP.click()
    await waitNextFrame(page)

    await simulateStream(page, ['New paragraph after code.'], {
      insertAt: 'cursor',
    })
    await waitForFlush(page, 'New paragraph after code.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('const x = 1')
    expect(markdown).toContain('New paragraph after code.')
  })

  test('insert after table preserves table', async ({ page }) => {
    await setMarkdown(page, '| A | B |\n| --- | --- |\n| 1 | 2 |\n\nEnd.')
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    const endP = editor.locator('p').last()
    await endP.click()
    await waitNextFrame(page)

    await simulateStream(page, ['After table.'], { insertAt: 'cursor' })
    await waitForFlush(page, 'After table.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // Table content should be preserved
    expect(markdown).toContain('A')
    expect(markdown).toContain('After table.')
  })

  test('insert between paragraphs preserves surrounding', async ({ page }) => {
    await setMarkdown(page, 'First paragraph.\n\nSecond paragraph.')
    await waitNextFrame(page)

    // Click at the start of second paragraph to place cursor between them
    const editor = page.locator('.editor')
    await editor.locator('p').last().click()
    await page.keyboard.press('Home')
    await waitNextFrame(page)

    await simulateStream(page, ['Middle content.'], { insertAt: 'cursor' })
    await waitForFlush(page, 'Middle content.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('First paragraph.')
    expect(markdown).toContain('Middle content.')
    expect(markdown).toContain('Second paragraph.')
  })

  test('insert inside list item uses plain text', async ({ page }) => {
    await setMarkdown(page, '- Item A\n- Item B')
    await waitNextFrame(page)

    // Click inside the first list item
    const editor = page.locator('.editor')
    const firstItem = editor.locator('li').first()
    await firstItem.click()
    await waitNextFrame(page)

    await simulateStream(page, [' extra'], { insertAt: 'cursor' })
    await waitForFlush(page, 'extra')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('extra')
    expect(markdown).toContain('Item B')
  })

  test('insert multi-line content inside list item splits inline and blocks', async ({
    page,
  }) => {
    await setMarkdown(page, '- Item A\n- Item B')
    await waitNextFrame(page)

    // Click inside the first list item
    const editor = page.locator('.editor')
    const firstItem = editor.locator('li').first()
    await firstItem.click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    // Stream multi-line content: first line merges into list item,
    // remaining lines become blocks after the list
    await simulateStream(
      page,
      [' suffix\n\nNew paragraph after list.\n\n- New item 1\n- New item 2'],
      { insertAt: 'cursor' }
    )
    await waitForFlush(page, 'New item 2')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // First line merged into the list item
    expect(markdown).toContain('suffix')
    // Block content inserted after the list
    expect(markdown).toContain('New paragraph after list.')
    expect(markdown).toContain('New item 1')
    expect(markdown).toContain('New item 2')
    // Original second list item preserved
    expect(markdown).toContain('Item B')
  })

  test('insert multi-line content inside code block stays as plain text', async ({
    page,
  }) => {
    await setMarkdown(page, '```\nexisting code\n```')
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    const codeBlock = editor.locator('.milkdown-code-block').first()
    await codeBlock.click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    // Multi-line content in code block should NOT be split into blocks
    await simulateStream(page, ['\n- not a list\n- just text'], {
      insertAt: 'cursor',
    })
    await waitForFlush(page, 'just text')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // All content stays as plain text inside the code block
    expect(markdown).toContain('existing code')
    expect(markdown).toContain('- not a list')
    expect(markdown).toContain('- just text')
  })

  test('insert inside code block uses plain text', async ({ page }) => {
    await setMarkdown(page, '```\noriginal code\n```')
    await waitNextFrame(page)

    // Click inside the code block
    const editor = page.locator('.editor')
    const codeBlock = editor.locator('.milkdown-code-block').first()
    await codeBlock.click()
    await waitNextFrame(page)

    await simulateStream(page, ['\nnew line'], { insertAt: 'cursor' })
    await waitForFlush(page, 'new line')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('original code')
    expect(markdown).toContain('new line')
  })

  test('insert inside table cell uses plain text', async ({ page }) => {
    await setMarkdown(page, '| A | B |\n| --- | --- |\n| 1 | 2 |')
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    const firstCell = editor.locator('td').first()
    await firstCell.click()
    await waitNextFrame(page)

    await simulateStream(page, ['hello\n- list item'], { insertAt: 'cursor' })
    await waitForFlush(page, 'hello')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // Should be plain text inside table, not parsed as list
    expect(markdown).toContain('hello')
    // Table structure preserved
    expect(markdown).toContain('A')
    expect(markdown).toContain('B')
  })

  test('insert inside heading splits inline and blocks', async ({ page }) => {
    await setMarkdown(page, '# My Title\n\nParagraph below.')
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    await editor.locator('h1').click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    await simulateStream(page, [' Extended\n\nNew content after heading.'], {
      insertAt: 'cursor',
    })
    await waitForFlush(page, 'New content after heading.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // First line merged into heading
    expect(markdown).toContain('Extended')
    // Block content after heading
    expect(markdown).toContain('New content after heading.')
    // Original paragraph preserved
    expect(markdown).toContain('Paragraph below.')
  })

  test('insert inside blockquote splits inline and blocks', async ({
    page,
  }) => {
    await setMarkdown(page, '> Quote text\n\nAfter quote.')
    await waitNextFrame(page)

    const editor = page.locator('.editor')
    await editor.locator('blockquote p').first().click()
    await page.keyboard.press('End')
    await waitNextFrame(page)

    await simulateStream(page, [' more\n\nOutside block.'], {
      insertAt: 'cursor',
    })
    await waitForFlush(page, 'Outside block.')

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    // First line merged into blockquote
    expect(markdown).toContain('more')
    // Block content after blockquote
    expect(markdown).toContain('Outside block.')
    // Original content preserved
    expect(markdown).toContain('After quote.')
  })
})
