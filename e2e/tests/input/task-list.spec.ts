import { expect, test } from '@playwright/test'
import { focusEditor } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('unchecked task list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('- [ ] task list')
  await expect(editor.locator('li')).toHaveAttribute('data-item-type', 'task')
  await expect(editor.locator('li')).toHaveAttribute('data-checked', 'false')
})

test('checked task list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('- [x] task list')
  await expect(editor.locator('li')).toHaveAttribute('data-item-type', 'task')
  await expect(editor.locator('li')).toHaveAttribute('data-checked', 'true')
})
