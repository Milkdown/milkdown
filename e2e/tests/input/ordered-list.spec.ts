import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('ordered list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('1. First item')
  await expect(editor.locator('ol li')).toHaveText('First item')
  let markdown = await getMarkdown(page)
  expect(markdown).toBe('1. First item\n')

  await page.keyboard.press('Enter')
  await page.keyboard.type('Second item')
  await expect(editor.locator('ol li:last-child')).toHaveText('Second item')
  markdown = await getMarkdown(page)
  expect(markdown).toBe('1. First item\n2. Second item\n')

  await page.keyboard.press('Enter')
  await page.keyboard.press('Backspace')
  await page.keyboard.type('1. Sub list item 1')
  await expect(editor.locator('ol ol li')).toHaveText('Sub list item 1')
  markdown = await getMarkdown(page)
  expect(markdown).toBe(
    '1. First item\n2. Second item\n\n   1. Sub list item 1\n'
  )

  await page.keyboard.press('Enter')
  await page.keyboard.type('Sub list item 2')
  await expect(editor.locator('ol ol li:last-child')).toHaveText(
    'Sub list item 2'
  )
  markdown = await getMarkdown(page)
  expect(markdown).toBe(
    '1. First item\n2. Second item\n\n   1. Sub list item 1\n   2. Sub list item 2\n'
  )

  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('Third item')
  await expect(editor.locator('ol:first-child>li:last-child')).toHaveText(
    'Third item'
  )
  markdown = await getMarkdown(page)
  expect(markdown).toBe(
    '1. First item\n2. Second item\n\n   1. Sub list item 1\n   2. Sub list item 2\n3. Third item\n'
  )
})
