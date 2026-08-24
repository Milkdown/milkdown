import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { gfm } from '..'

async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
  editor.use(gfm)
  await editor.create()
  return editor
}

async function roundTrip(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.action(getMarkdown())
}

function expectKeepsBr(output: string, ...pieces: (string | RegExp)[]) {
  expect(output).toMatch(/<br\s*\/?>/i)
  for (const piece of pieces) {
    if (typeof piece === 'string') expect(output).toContain(piece)
    else expect(output).toMatch(piece)
  }
}

describe('inline br in gfm containers', () => {
  it('does not drop a footnote whose serializer emitted a block <br>', async () => {
    const input = '[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toContain('[^note]')
    expect(output).toMatch(/foo/)
    expect(output).toMatch(/bar/)
  })

  it('keeps a referenced footnote whose definition has a block <br>', async () => {
    const input = 'See [^note].\n\n[^note]: foo\n\n    <br />\n\n    bar\n\n'
    const output = await roundTrip(input)
    expect(output).toContain('[^note]')
    expect(output).toContain('See')
    expect(output).toMatch(/foo/)
    expect(output).toMatch(/bar/)
  })

  it('keeps an inline <br> inside a footnote definition', async () => {
    const output = await roundTrip('[^note]: foo<br>bar\n')
    expectKeepsBr(output, '[^note]', 'foo', 'bar')
  })

  it('still treats a lone table-cell <br> as an empty-line placeholder', async () => {
    const output = await roundTrip('| <br> | c |\n| --- | --- |\n')
    expect(output).toMatch(/\|/)
    expect(output).toContain('c')
  })

  it('keeps sibling text and an inline <br> inside a table cell', async () => {
    const output = await roundTrip('| a<br>b | c |\n| --- | --- |\n')
    expectKeepsBr(output, 'a', 'b', 'c')
  })

  it('keeps a lone <br> inside strikethrough', async () => {
    const output = await roundTrip('~~<br>~~\n')
    expectKeepsBr(output)
    expect(output).toMatch(/~~|<del>/)
  })

  it('keeps an inline <br> inside a task list item', async () => {
    const output = await roundTrip('- [ ] foo<br>bar\n')
    expectKeepsBr(output, 'foo', 'bar')
    expect(output).toMatch(/\[ \]|\[x\]/i)
  })
})
