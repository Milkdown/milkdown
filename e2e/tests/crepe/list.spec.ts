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
