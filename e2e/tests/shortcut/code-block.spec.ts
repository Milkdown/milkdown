import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('code block', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')

  let up = await pressMetaKey(page)
  await page.keyboard.press('Alt+c')
  await up()

  await expect(editor.locator('code')).toHaveText('The lunatic is on the grass')
})
