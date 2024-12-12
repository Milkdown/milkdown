import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('blockquote', async ({ page }) => {
  await focusEditor(page)
  const blockquoteMarkdown = await loadFixture('blockquote.md')
  await setMarkdown(page, blockquoteMarkdown)

  expect(await page.locator('blockquote p').count()).toBe(2)
  expect(
    await page.locator('blockquote span[data-type="hardbreak"]').count()
  ).toBe(1)
})
