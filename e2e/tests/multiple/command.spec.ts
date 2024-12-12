import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/multi-editor/')
})

test('insert table', async ({ page }) => {
  const milkdown = page.locator('.milkdown')
  expect(await milkdown.count()).toBe(2)

  await page.evaluate(() => {
    window.commands.addTable?.()
    window.commands.addTable2?.()
  })

  expect(await page.locator('.milkdown:first-child table').count()).toBe(1)
  expect(await page.locator('.milkdown:last-child table').count()).toBe(1)

  expect(await page.locator('table').count()).toBe(2)
})
