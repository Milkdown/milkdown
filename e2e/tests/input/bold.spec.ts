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

test('should not parse when preceded by word and followed by quote', async ({
  page,
}) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('a**"foo"**')

  // Expect no <strong> element created.
  await expect(editor.locator('strong')).toHaveCount(0)

  const markdown = await getMarkdown(page)
  // The markdown should remain unchanged (with newline appended by Milkdown serializer).
  expect(markdown).toBe('a\\*\\*"foo"\\*\\*\n')
})

test('should not parse double underscore inside word', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('foo__bar__baz')

  await expect(editor.locator('strong')).toHaveCount(0)

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('foo\\_\\_bar\\_\\_baz\n')
})
