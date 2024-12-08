import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('bold with _', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is __on the grass__')
  await expect(editor.locator('strong')).toHaveText('on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is __on the grass__\n')
})

test('bold with *', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is **on the grass**')
  await expect(editor.locator('strong')).toHaveText('on the grass')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is **on the grass**\n')
})

test('bold with a single character', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is **o**n the grass')
  await expect(editor.locator('strong')).toHaveText('o')
  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic is **o**n the grass\n')
})
