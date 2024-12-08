import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('hr', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('hr.md')
  await setMarkdown(page, markdown)

  expect(await page.locator('.editor>hr').count()).toBe(1)
})
