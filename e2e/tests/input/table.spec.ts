import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('3x2', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('|3x2|')
  await page.keyboard.press('Space')
  await expect(editor.locator('table')).toHaveCount(1)
  await expect(editor.locator('tr')).toHaveCount(2)
  await expect(editor.locator('th')).toHaveCount(3)
  await expect(editor.locator('td')).toHaveCount(3)
})

test('4x5', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('|4x5|')
  await page.keyboard.press('Space')
  await expect(editor.locator('table')).toHaveCount(1)
  await expect(editor.locator('tr')).toHaveCount(5)
  await expect(editor.locator('th')).toHaveCount(4)
  await expect(editor.locator('td')).toHaveCount(16)
})

test('remove list item after table', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('|1x1|')
  await page.keyboard.press('Space')
  const up = await pressMetaKey(page)
  await page.keyboard.press('Enter')
  await up()
  await page.keyboard.type('-')
  await page.keyboard.press('Space')
  await expect(editor.locator('ul')).toHaveCount(1)
  await page.keyboard.press('Backspace')
  await expect(editor.locator('> ul')).toHaveCount(0)
})
