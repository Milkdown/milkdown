import '@testing-library/jest-dom/vitest'
import { defaultValueCtx, Editor } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'

async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
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

// https://github.com/Milkdown/milkdown/issues/2428
// remarkPreserveEmptyLinePlugin used to splice every html <br> out of the
// mdast, including user-authored inline breaks. Only a lone <br> that marks
// a preserved empty line should be removed.
describe('inline br round-trip (#2428)', () => {
  it('keeps a break in foo<br>bar after load and getMarkdown', async () => {
    const output = await roundTrip('foo<br>bar\n')
    expect(output).toBe('foo<br>bar\n')
  })

  it('does not delete the <br> in line one <br> line two', async () => {
    const output = await roundTrip('line one <br> line two\n')
    expect(output).toBe('line one <br> line two\n')
  })

  it('still folds a block-level <br> into a preserved empty paragraph', async () => {
    const output = await roundTrip('para one\n\n<br>\n\npara two\n')
    expect(output).toBe('para one\n\n<br />\n\npara two\n')
  })

  it.each([
    ['<br>', 'foo<br> bar\n'],
    ['<br/>', 'foo<br/> bar\n'],
    ['<br />', 'foo<br /> bar\n'],
    ['<br >', 'foo<br > bar\n'],
  ] as const)('keeps sibling text around inline %s', async (_tag, input) => {
    const output = await roundTrip(input)
    expectKeepsBr(output, 'foo', 'bar')
  })

  it('keeps consecutive inline breaks in foo<br><br>bar', async () => {
    const output = await roundTrip('foo<br><br>bar\n')
    expect(output).toContain('foo')
    expect(output).toContain('bar')
    const breaks = output.match(/<br\s*\/?>/gi) ?? []
    expect(breaks.length).toBeGreaterThanOrEqual(2)
  })

  it('keeps a lone <br> inside an ATX heading', async () => {
    const output = await roundTrip('# <br>\n')
    expectKeepsBr(output)
    expect(output.startsWith('#')).toBe(true)
  })

  it('keeps a lone <br> inside a level-2 heading', async () => {
    const output = await roundTrip('## <br>\n')
    expectKeepsBr(output)
    expect(output.startsWith('##')).toBe(true)
  })

  it('keeps an inline <br> inside a heading with siblings', async () => {
    const output = await roundTrip('# title<br>more\n')
    expectKeepsBr(output, 'title', 'more')
    expect(output.startsWith('#')).toBe(true)
  })

  it('keeps a lone <br> inside a link', async () => {
    const output = await roundTrip('[<br>](https://example.com)\n')
    expectKeepsBr(output, 'https://example.com')
  })

  it('keeps an inline <br> between link text siblings', async () => {
    const output = await roundTrip('[foo<br>bar](https://example.com)\n')
    expectKeepsBr(output, 'foo', 'bar', 'https://example.com')
  })

  it('keeps a lone <br> inside emphasis', async () => {
    const output = await roundTrip('*<br>*\n')
    expectKeepsBr(output)
    expect(output).toMatch(/\*|_|<em>/)
  })

  it('keeps a lone <br> inside strong', async () => {
    const output = await roundTrip('**<br>**\n')
    expectKeepsBr(output)
    expect(output).toMatch(/\*\*|__|<strong>/)
  })

  it('keeps an inline <br> between strong siblings', async () => {
    const output = await roundTrip('**foo<br>bar**\n')
    expectKeepsBr(output, 'foo', 'bar')
    expect(output).toMatch(/\*\*|__|<strong>/)
  })

  it('still preserves an empty line inside a blockquote', async () => {
    const output = await roundTrip('> foo\n>\n> <br>\n>\n> bar\n')
    expect(output).toContain('foo')
    expect(output).toContain('bar')
    expect(output).toMatch(/^>/m)
    expect(output).toMatch(/<br\s*\/?>/i)
  })

  it('still preserves an empty line inside a list item', async () => {
    const output = await roundTrip('* foo\n\n  <br>\n\n  bar\n')
    expect(output).toContain('foo')
    expect(output).toContain('bar')
    expect(output).toMatch(/^(\*|-|\d+\.)/m)
    expect(output).toMatch(/<br\s*\/?>/i)
  })

  it('keeps an inline <br> inside a list item', async () => {
    const output = await roundTrip('* foo<br>bar\n')
    expectKeepsBr(output, 'foo', 'bar')
    expect(output).toMatch(/^(\*|-|\d+\.)/m)
  })

  it('keeps an inline <br> inside a blockquote', async () => {
    const output = await roundTrip('> foo<br>bar\n')
    expectKeepsBr(output, 'foo', 'bar')
    expect(output).toMatch(/^>/m)
  })
})
