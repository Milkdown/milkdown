import { expect, test } from '@playwright/test'

import { focusEditor, getMarkdown, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/crepe/')
})

test('should be able to use insert macro to insert block', async ({ page }) => {
  page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('123')
  await page.evaluate(() => {
    const crepe = window.__crepe__
    const insert = window.__macros__.insert
    crepe.editor.action(insert('456'))
  })

  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toBe('123\n\n456')
})

test('should be able to use insert macro to insert inline', async ({
  page,
}) => {
  page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('123')
  await page.evaluate(() => {
    const crepe = window.__crepe__
    const insert = window.__macros__.insert
    crepe.editor.action(insert('456', true))
  })

  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toBe('123456')
})

test('should inline macro extend current mark', async ({ page }) => {
  page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('**123**')

  await selectAll(page)
  await page.keyboard.press('ArrowRight')

  await page.evaluate(() => {
    const crepe = window.__crepe__
    const insert = window.__macros__.insert
    crepe.editor.action(insert('456', true))
  })

  const markdown = await getMarkdown(page)
  expect(markdown.trim()).toBe('**123456**')
})
