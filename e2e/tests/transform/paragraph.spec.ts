import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('paragraph', async ({ page }) => {
  await focusEditor(page)
  const paragraphMarkdown = await loadFixture('paragraph.md')
  await setMarkdown(page, paragraphMarkdown)
  await expect(page.locator('p')).toHaveText('The lunatic is on the grass')
})
