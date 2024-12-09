import { expect, test } from '@playwright/test'
import {
  focusEditor,
  paste,
  getMarkdown,
  setMarkdown,
  waitNextFrame,
} from '../misc'

test.beforeEach(async ({ page }) => {
  await page.goto('/preset-commonmark/')
})

test('paste inline markdown', async ({ page }) => {
  await focusEditor(page)
  await page.keyboard.type('The dark side of the ')
  await paste(page, { 'text/plain': '**moon**' })

  await expect(page.locator('.editor strong').first()).toHaveText('moon')
  expect(await getMarkdown(page)).toBe('The dark side of the **moon**\n')
})

test('paste block markdown', async ({ page }) => {
  await focusEditor(page)
  await paste(page, {
    'text/plain': '* Concorde files in my room\n* Tears the house to shreds',
  })

  await expect(page.locator('.editor ul li:first-child')).toHaveText(
    'Concorde files in my room'
  )
  await expect(page.locator('.editor ul li:last-child')).toHaveText(
    'Tears the house to shreds'
  )
})

test('paste code from vscode', async ({ page }) => {
  await focusEditor(page)
  await paste(page, {
    'text/plain': 'const a = 1;',
    'vscode-editor-data': JSON.stringify({ mode: 'javascript' }),
  })

  await expect(page.locator('.editor pre')).toHaveAttribute(
    'data-language',
    'javascript'
  )
  await expect(page.locator('.editor pre code')).toHaveText('const a = 1;')
})

test('paste html', async ({ page }) => {
  await focusEditor(page)
  await paste(page, {
    'text/html':
      '<h1>The Place Where He Inserted the <strong>Blade</strong></h1>',
  })

  await expect(page.locator('.editor h1')).toHaveText(
    'The Place Where He Inserted the Blade'
  )
  await expect(page.locator('.editor strong')).toHaveText('Blade')
  expect(await getMarkdown(page)).toBe(
    '# The Place Where He Inserted the **Blade**\n'
  )
})

test('paste inline text only html should extend mark', async ({ page }) => {
  await focusEditor(page)
  await setMarkdown(page, '[milkdown repo](https://milkdown.dev)')

  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')

  await paste(page, {
    'text/html':
      '<meta charset=\'utf-8\'><span style="color: rgb(36, 41, 47);">mono</span>',
  })
  await waitNextFrame(page)
  expect(await getMarkdown(page)).toBe(
    '[milkdown monorepo](https://milkdown.dev)\n'
  )
})
