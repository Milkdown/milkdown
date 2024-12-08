import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('paragraph', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await expect(editor.locator('p')).toHaveText('The lunatic is on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is on the grass\n')
})
