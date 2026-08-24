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

  it('keeps a lone <br> inside a heading', async () => {
    const output = await roundTrip('# <br>\n')
    expect(output).toContain('<br')
    expect(output.startsWith('#')).toBe(true)
  })

  it('keeps a lone <br> inside a link', async () => {
    const output = await roundTrip('[<br>](https://example.com)\n')
    expect(output).toContain('https://example.com')
    expect(output).toContain('<br')
  })
})
