import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('bullet list', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('* List item 1')
  await expect(editor.locator('ul li')).toHaveText('List item 1')
  let markdown = await getMarkdown(page)
  expect(markdown).toBe('* List item 1\n')

  await page.keyboard.press('Enter')
  await page.keyboard.type('List item 2')
  await expect(editor.locator('ul li:last-child')).toHaveText('List item 2')
  markdown = await getMarkdown(page)
  expect(markdown).toBe('* List item 1\n* List item 2\n')

  await page.keyboard.press('Enter')
  await page.keyboard.press('Backspace')
  await page.keyboard.type('- Sub list item 1')
  await expect(editor.locator('ul ul li')).toHaveText('Sub list item 1')
  markdown = await getMarkdown(page)
  expect(markdown).toBe('* List item 1\n* List item 2\n\n  * Sub list item 1\n')

  await page.keyboard.press('Enter')
  await page.keyboard.type('Sub list item 2')
  await expect(editor.locator('ul ul li:last-child')).toHaveText(
    'Sub list item 2'
  )
  markdown = await getMarkdown(page)
  expect(markdown).toBe(
    '* List item 1\n* List item 2\n\n  * Sub list item 1\n  * Sub list item 2\n'
  )

  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.type('List item 3')
  await expect(editor.locator('ul:first-child>li:last-child')).toHaveText(
    'List item 3'
  )
  markdown = await getMarkdown(page)
  expect(markdown).toBe(
    '* List item 1\n* List item 2\n\n  * Sub list item 1\n  * Sub list item 2\n* List item 3\n'
  )
})
