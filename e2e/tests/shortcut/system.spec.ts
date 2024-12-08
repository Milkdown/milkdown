import { expect, test } from '@playwright/test'
import { focusEditor, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('enter', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await page.keyboard.press('Enter')
  await page.keyboard.type('The lunatic is in the hall')
  expect(await editor.locator('p').count()).toBe(2)
})

test('hardbreak', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await page.keyboard.down('Shift')
  await page.keyboard.press('Enter')
  await page.keyboard.up('Shift')
  await page.keyboard.type('The lunatic is in the hall')
  expect(await editor.locator('p').count()).toBe(1)
  expect(await editor.locator('br').count()).toBe(1)
})

test('delete', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await page.keyboard.press('Backspace')
  await expect(editor.locator('p').first()).toHaveText(
    'The lunatic is on the gras'
  )
  await page.keyboard.press('Backspace')
  await expect(editor.locator('p').first()).toHaveText(
    'The lunatic is on the gra'
  )
})

test('select all', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await selectAll(page)
  await page.keyboard.type('Lunatic')
  await expect(editor.locator('p').first()).toHaveText('Lunatic')
})
