import { expect, test } from '@playwright/test'

import { focusEditor, getMarkdown } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-gfm/')
})

test('strike through', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is ~~on the grass~~')
  await expect(editor.locator('del')).toHaveText('on the grass')
})

test('intra-word strike through', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('C:/the/~lunatic~/is/on/the/grass')
  await expect(editor.locator('del')).toHaveCount(0)

  const markdown = await getMarkdown(page)

  expect(markdown).toBe('C:/the/\\~lunatic\\~/is/on/the/grass\n')
})
