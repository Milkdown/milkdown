import { expect, test } from '@playwright/test'

import { focusEditor, getMarkdown, waitNextFrame } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('latex block preview toggle', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('1.')
  await page.keyboard.press('Space')
  await waitNextFrame(page)
  await page.keyboard.type('First item')
  const li = editor.locator('ol li')
  await expect(li).toHaveCount(1)
  await expect(li).toContainText('First item')

  await page.keyboard.press('Enter')
  await waitNextFrame(page)
  await page.keyboard.type('Second item')
  await expect(li).toHaveCount(2)
  await expect(li.nth(1)).toContainText('Second item')

  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toBe('1. First item\n2. Second item')
})

test('should focus on the editor after clicking on the list item', async ({
  page,
}) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await waitNextFrame(page)
  await page.keyboard.type('- [ ]', { delay: 20 })
  await page.keyboard.press('Space')
  await waitNextFrame(page)
  await page.keyboard.type('First item')
  const li = editor.locator('ul li')
  await expect(li).toHaveCount(1)
  await expect(li).toContainText('First item')

  await editor.blur()

  const isBlurred = await editor.evaluate(() => !window.__view__.hasFocus())
  expect(isBlurred).toBe(true)

  // Click on the list item
  await li.locator('.label-wrapper').click()
  await waitNextFrame(page)
  // Check if the editor is focused
  const isFocused = await editor.evaluate(() => window.__view__.hasFocus())
  expect(isFocused).toBe(true)

  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toBe('* [x] First item')
})
