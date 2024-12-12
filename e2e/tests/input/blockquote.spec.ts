import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('blockquote', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('> Blockquote')
  await expect(editor.locator('blockquote p')).toHaveText('Blockquote')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('> Blockquote\n')

  await page.keyboard.press('Enter')
  await page.keyboard.type('Next line.')
  await expect(editor.locator('blockquote p:last-child')).toHaveText(
    'Next line.'
  )
  const markdown2 = await getMarkdown(page)
  expect(markdown2).toBe('> Blockquote\n>\n> Next line.\n')
})
