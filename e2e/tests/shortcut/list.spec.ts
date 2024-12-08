import { expect, test } from '@playwright/test'
import { focusEditor, pressMetaKey } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('ordered list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')

  let up = await pressMetaKey(page)
  await page.keyboard.press('Alt+7')
  await up()

  await expect(editor.locator('ol>li').first()).toHaveText(
    'The lunatic is on the grass'
  )
  await page.keyboard.press('Enter')
  await page.keyboard.type('The lunatic is in the hall')

  up = await pressMetaKey(page)
  await page.keyboard.press(']')
  await up()
  expect(await editor.locator('ol').count()).toBe(2)

  up = await pressMetaKey(page)
  await page.keyboard.press('[')
  await up()
  expect(await editor.locator('ol').count()).toBe(1)
})

test('bullet list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')

  let up = await pressMetaKey(page)
  await page.keyboard.press('Alt+8')
  await up()

  await expect(editor.locator('ul>li').first()).toHaveText(
    'The lunatic is on the grass'
  )
  await page.keyboard.press('Enter')
  await page.keyboard.type('The lunatic is in the hall')

  up = await pressMetaKey(page)
  await page.keyboard.press(']')
  await up()
  expect(await editor.locator('ul').count()).toBe(2)

  up = await pressMetaKey(page)
  await page.keyboard.press('[')
  await up()
  expect(await editor.locator('ul').count()).toBe(1)
})
