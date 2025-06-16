import { expect, test } from '@playwright/test'

import {
  focusEditor,
  loadFixture,
  selectAll,
  setMarkdown,
  waitNextFrame,
} from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('hardbreak', async ({ page }) => {
  await focusEditor(page)
  const markdown = await loadFixture('hardbreak.md')
  await setMarkdown(page, markdown)

  await focusEditor(page)
  await selectAll(page)
  await page.keyboard.press('ArrowLeft')
  await waitNextFrame(page)

  const from = await page.evaluate(() => window.__view__.state.selection.from)
  expect(from).toBe(1)

  await page.keyboard.press('ArrowDown')
  await waitNextFrame(page)

  const name = await page.evaluate(
    () => window.__view__.state.selection.$from.node().type.name
  )
  expect(name).toBe('code_block')
})
