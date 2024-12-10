import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('italic', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await selectAll(page)
  let up = await pressMetaKey(page)
  await page.keyboard.press('i')
  await up()
  await expect(editor.locator('em').first()).toHaveText(
    'The lunatic is on the grass'
  )

  await selectAll(page)
  up = await pressMetaKey(page)
  await page.keyboard.press('i')
  await up()
  expect(await editor.locator('em').count()).toBe(0)
})
