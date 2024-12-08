import { expect, test } from '@playwright/test'
import { focusEditor, getMarkdown, pressMetaKey, selectAll } from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('standard bold', async ({ page }) => {
  const editor = page.locator('.editor')
  await focusEditor(page)
  await page.keyboard.type('The lunatic is on the grass')
  await selectAll(page)
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await expect(editor.locator('strong').first()).toHaveText(
    'The lunatic is on the grass'
  )

  await selectAll(page)
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  expect(await editor.locator('strong').count()).toBe(0)
})

test('end with space', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The lunatic ')
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type('on the ')
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' grass')

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic **on the**  grass\n')
})

test('end with spaces', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The lunatic ')
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type('on the    ')
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' grass')

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic **on the**     grass\n')
})

test('start with space', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The lunatic ')
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' is on the')
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' grass')

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic  **is on the** grass\n')
})

test('start with spaces', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The lunatic ')
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type('    is on the')
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' grass')

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic     **is on the** grass\n')
})

test('start and end with spaces', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The lunatic ')
  let up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type('    is on the    ')
  up = await pressMetaKey(page)
  await page.keyboard.press('b')
  await up()
  await page.keyboard.type(' grass')

  const markdown = await getMarkdown(page)
  expect(markdown).toBe('The lunatic     **is on the**     grass\n')
})
