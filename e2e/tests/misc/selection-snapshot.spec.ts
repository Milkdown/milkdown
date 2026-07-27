import { expect, test } from '@playwright/test'

import {
  focusEditor,
  getSelectionSnapshot,
  selectAll,
  setCaretByTextOffset,
  setMarkdown,
  traceKey,
} from '.'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('selection snapshot renders caret walks', async ({ page }) => {
  await focusEditor(page)
  await setMarkdown(page, '**bold** text')
  await setCaretByTextOffset(page, 0)

  const snapshots = await traceKey(page, 'ArrowRight', 3)
  expect(snapshots).toEqual([
    '┃bold text',
    'b┃old text',
    'bo┃ld text',
    'bol┃d text',
  ])
})

test('selection snapshot renders ranges and blocks', async ({ page }) => {
  await focusEditor(page)
  await setMarkdown(page, 'one\n\ntwo')

  await selectAll(page)
  expect(await getSelectionSnapshot(page)).toBe('❰one\ntwo❱')

  await setCaretByTextOffset(page, 4)
  expect(await getSelectionSnapshot(page)).toBe('one\n┃two')
})
