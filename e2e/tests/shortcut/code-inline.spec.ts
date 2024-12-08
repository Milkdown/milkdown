import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('code inline', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await selectAll(page)
  let up = await pressMetaKey(page)
  await page.keyboard.press('e')
  await up()
  await expect(editor.locator('code').first()).toHaveText(
    'The lunatic is on the grass'
  )

  await selectAll(page)
  up = await pressMetaKey(page)
  await page.keyboard.press('e')
  await up()
  expect(await editor.locator('code').count()).toBe(0)
})
