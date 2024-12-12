import { expect, test } from '@playwright/test'
import { focusEditor } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('strike through', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is ~~on the grass~~')
  await expect(editor.locator('del')).toHaveText('on the grass')
})
