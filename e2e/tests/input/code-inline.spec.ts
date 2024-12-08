import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('code inline', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is `on the grass`')
  await expect(editor.locator('code')).toHaveText('on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is `on the grass`\n')
})
