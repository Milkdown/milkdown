import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { getMarkdown, setMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe-streaming/')
})

async function simulateStream(page: Page, tokens: string[], delayMs = 30) {
  await page.evaluate(() => window.__startStreaming__())
  await waitNextFrame(page)

  for (const token of tokens) {
    await page.evaluate((t) => window.__pushChunk__(t), token)
    if (delayMs > 0) await page.waitForTimeout(delayMs)
  }
}

test.describe('streaming basics', () => {
  test('streaming renders content progressively', async ({ page }) => {
    await simulateStream(page, ['# Hello', '\n\n', 'World'])
    // Wait for throttle flush
    await page.waitForTimeout(200)

    const editor = page.locator('.editor')
    await expect(editor.locator('h1')).toContainText('Hello')
    await expect(editor.locator('p').first()).toContainText('World')
  })

  test('endStreaming finalizes content', async ({ page }) => {
    await simulateStream(page, ['# Title', '\n\n', 'Paragraph.'])
    await page.waitForTimeout(200)

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
    await page.waitForTimeout(200)

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
    await page.waitForTimeout(200)

    await page.evaluate(() => window.__abortStreaming__({ keep: false }))
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('Original content')
    expect(markdown).not.toContain('Replaced')
  })

  test('abort with keep=true preserves partial content', async ({ page }) => {
    await simulateStream(page, ['# Partial', '\n\n', 'Content.'])
    await page.waitForTimeout(200)

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
    await page.waitForTimeout(200)

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
    await page.waitForTimeout(200)

    await page.evaluate(() => window.__endStreaming__())
    await waitNextFrame(page)

    const markdown = await getMarkdown(page)
    expect(markdown).toContain('const x = 1')
  })
})
