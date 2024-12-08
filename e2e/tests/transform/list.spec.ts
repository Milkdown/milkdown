import { expect, test } from '@playwright/test'
import { focusEditor, loadFixture, setMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('list', async ({ page }) => {
  await focusEditor(page)
  const listMarkdown = await loadFixture('list.md')
  await setMarkdown(page, listMarkdown)

  expect(await page.locator('.editor>ul').count()).toBe(2)
  expect(await page.locator('.editor>ul:first-child li').count()).toBe(4)
  expect(await page.locator('.editor>ul:first-child>li').count()).toBe(2)

  await expect(
    page.locator('.editor>ul:first-child ul>li:first-child')
  ).toHaveText('Remembering games and daisy chains and laughs')

  expect(await page.locator('.editor>ol').count()).toBe(1)
  expect(await page.locator('.editor>ol li').count()).toBe(4)
  expect(await page.locator('.editor>ol>li').count()).toBe(2)

  await expect(page.locator('.editor>ol ol>li:first-child')).toHaveText(
    'The paper holds their folded faces to the floor'
  )

  expect(await page.locator('.editor>ul:last-child li').count()).toBe(8)
  expect(await page.locator('.editor>ul:last-child ul').count()).toBe(1)
  expect(await page.locator('.editor>ul:last-child ol').count()).toBe(2)
})
