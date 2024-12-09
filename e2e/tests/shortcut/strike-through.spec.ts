import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('strike through', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await selectAll(page)
  let up = await pressMetaKey(page)
  await page.keyboard.press('Alt+x')
  await up()
  await expect(editor.locator('del').first()).toHaveText(
    'The lunatic is on the grass'
  )

  await selectAll(page)
  up = await pressMetaKey(page)
  await page.keyboard.press('Alt+x')
  await up()
  expect(await editor.locator('del').count()).toBe(0)
})
