import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'

import { focusEditor, loadFixture } from '../misc'

// `header-only-table.md` is left out. The table plugin gives such a table
// an empty body row as soon as a transaction loads it, so the document no
// longer has the content of its source.
const fixtures = [
  'blockquote.md',
  'cm-mark.md',
  'code-block.md',
  'hardbreak.md',
  'heading.md',
  'hr.md',
  'html.md',
  'image.md',
  'list.md',
  'many-code-blocks.md',
  'ordered-list-custom-start.md',
  'paragraph.md',
  'preserve-empty-line.md',
]

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__beforeCrepeCreate__ = (crepe) => {
      crepe.editor.config((ctx) => {
        ctx.set('preserveSource', true)
      })
    }
  })
  await page.goto('/crepe/')
})

async function load(page: Page, markdown: string) {
  await page.evaluate((markdown) => {
    window.__crepe__.editor.action(window.__macros__.replaceAll(markdown))
  }, markdown)
}

const getMarkdown = (page: Page) =>
  page.evaluate(() => window.__crepe__.getMarkdown())

for (const fixture of fixtures) {
  test(`gives back ${fixture} as it was loaded`, async ({ page }) => {
    const markdown = await loadFixture(fixture)
    await load(page, markdown)

    expect(await getMarkdown(page)).toBe(markdown)
  })
}

test('gives the source back once an edit is undone', async ({ page }) => {
  const markdown = 'Title\n=====\n\n- a\n- b\n\n|x|y|\n|-|-|\n|1|2|'
  await load(page, markdown)
  expect(await getMarkdown(page)).toBe(markdown)

  await focusEditor(page)
  await page.keyboard.type('!')
  expect(await getMarkdown(page)).not.toBe(markdown)

  await page.keyboard.press('Backspace')
  expect(await getMarkdown(page)).toBe(markdown)
})

test('writes only the block that the user edits', async ({ page }) => {
  const table = '|x|y|\n|-|-|\n|1|2|'
  const rest = `- a\n- b\n\n\n${table}\n\nSee [the link][ref].\n\n[ref]: https://example.com\n\n~~~js\ncode\n~~~`
  await load(page, `Title\n=====\n\n${rest}`)

  // Put the caret at the start of the heading.
  await page.evaluate(() => window.__setCaretByTextOffset__(0))
  await page.keyboard.type('!')
  expect(await getMarkdown(page)).toBe(`# !Title\n\n${rest}`)

  // A space at the end of a block is gone after a reload. The other
  // blocks must keep their text all the same.
  await page.keyboard.press('End')
  await page.keyboard.type(' ')
  expect(await getMarkdown(page)).toBe(`# !Title \n\n${rest}`)
})
