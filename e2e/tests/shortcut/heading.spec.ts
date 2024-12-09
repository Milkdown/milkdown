import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('heading', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  let up = await pressMetaKey(page)
  await page.keyboard.press('Alt+1')
  await up()
  await expect(editor.locator('h1').first()).toHaveText(
    'The lunatic is on the grass'
  )
  up = await pressMetaKey(page)
  await page.keyboard.press('Alt+2')
  await up()
  await expect(editor.locator('h2').first()).toHaveText(
    'The lunatic is on the grass'
  )
  up = await pressMetaKey(page)
  await page.keyboard.press('Alt+0')
  await up()
  await expect(editor.locator('p').first()).toHaveText(
    'The lunatic is on the grass'
  )
})
