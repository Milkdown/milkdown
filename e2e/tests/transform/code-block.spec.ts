import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('code block', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('code-block.md')
  await setMarkdown(page, markdown)

  expect(await page.locator('pre').count()).toBe(2)
  await expect(page.locator('pre:first-child')).not.toHaveAttribute(
    'data-language'
  )
  await expect(page.locator('pre:last-child')).toHaveAttribute(
    'data-language',
    'javascript'
  )
})
