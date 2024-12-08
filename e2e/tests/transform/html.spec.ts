import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('html', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('html.md')
  await setMarkdown(page, markdown)

  expect(await page.locator('span[data-type="html"]').count()).toBe(3)
  await expect(page.locator('span[data-type="html"]').first()).toHaveText(
    '<h1>Heading</h1>'
  )
  await expect(page.locator('span[data-type="html"]').nth(1)).toHaveText(
    '<strong>'
  )
  await expect(page.locator('span[data-type="html"]').last()).toHaveText(
    '</strong>'
  )
})
