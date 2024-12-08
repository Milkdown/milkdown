import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('italic with _', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is _on the grass_')
  await expect(editor.locator('em')).toHaveText('on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is _on the grass_\n')
})

test('italic with *', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is *on the grass*')
  await expect(editor.locator('em')).toHaveText('on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is *on the grass*\n')
})

test('italic with a single character', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is *o*n the grass')
  await expect(editor.locator('em')).toHaveText('o')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is *o*n the grass\n')
})

test('undo input rule when press backspace', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is *on the grass*')
  await expect(editor.locator('em')).toHaveText('on the grass')
  await page.keyboard.press('Backspace')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is \\*on the grass\\*\n')
})
