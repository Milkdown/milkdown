import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('hr', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('---')
  await expect(editor.locator('hr')).toBeVisible()
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('***\n')
})
