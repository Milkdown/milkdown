import { expect, test } from '@playwright/test'

import { focusEditor, getMarkdown, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('preserve empty line', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('preserve-empty-line.md')
  await setMarkdown(page, markdown)

  expect(await page.locator('p').count()).toBe(5)
  expect(await page.locator('p').nth(0).textContent()).toBe('123')
  expect(await page.locator('p').nth(1).textContent()).toBe('')
  expect(await page.locator('p').nth(2).textContent()).toBe('456')
  expect(await page.locator('p').nth(3).textContent()).toBe('')
  expect(await page.locator('p').nth(4).textContent()).toBe('789')

  const markdownOutput = await getMarkdown(page)
  expect(markdownOutput.trim()).toBe(markdown.trim())
})
