import { expect, test } from '@playwright/test'

import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('allow header only table', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('header-only-table.md')
  await setMarkdown(page, markdown)

  expect(await page.locator('table').count()).toBe(1)
  expect(await page.locator('th').count()).toBe(1)
  expect(await page.locator('th').nth(0).textContent()).toBe(
    'header only table'
  )
})
