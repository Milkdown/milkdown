import '@testing-library/jest-dom/vitest'
import type { Node, Schema } from '@milkdown/prose/model'

import {
  Editor,
  editorViewCtx,
  parserCtx,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'
import { withEditor } from './test-utils'

function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  return editor
}

it(`should handle trailing space`, async () => {
  const user = userEvent.setup()
  const editor = createEditor()

  await editor.create()

  const view = editor.ctx.get(editorViewCtx)

  await user.type(view.dom, 'word ')

  const markdown = editor.action(getMarkdown())
  expect(markdown).toBe('word \n')
})

// https://github.com/Milkdown/milkdown/issues/2535
// The trailing whitespace of a text is written as it is, but the rest of
// the text must still be escaped. Otherwise it reopens as other content.
describe('escaping of text that ends with whitespace (#2535)', () => {
  function serialize(build: (schema: Schema) => Node[]) {
    return withEditor('', (editor) => {
      const schema = editor.ctx.get(schemaCtx)
      const doc = schema.node('doc', null, build(schema))
      const output = editor.ctx.get(serializerCtx)(doc)
      return { doc, output, reopened: editor.ctx.get(parserCtx)(output) }
    })
  }

  it.each([
    ['see [a](b) ', String.raw`see \[a]\(b) *y*`],
    ['AT&amp;T ', String.raw`AT\&amp;T *y*`],
    ['a <b>c</b> ', String.raw`a \<b>c\</b> *y*`],
    ['use `x` ', 'use \\`x\\` *y*'],
    ['![a](b) ', String.raw`!\[a]\(b) *y*`],
    ['<https://a.b> ', String.raw`\<https://a.b> *y*`],
    ['a*\t', 'a\\*\t*y*'],
  ])('escapes %j before an italic text', async (text, markdown) => {
    const { doc, output, reopened } = await serialize((schema) => [
      schema.node('paragraph', null, [
        schema.text(text),
        schema.text('y', [schema.marks.emphasis!.create()]),
      ]),
    ])
    expect(output).toBe(`${markdown}\n`)
    expect(reopened.eq(doc), output).toBe(true)
  })

  // The parser drops whitespace at the end of a paragraph. The rest of the
  // text must still reopen as the same text.
  it.each([
    ['see [a](b) ', String.raw`see \[a]\(b) `],
    ['# title ', String.raw`\# title `],
    ['> quote ', String.raw`\> quote `],
    ['- item ', String.raw`\- item `],
    ['1. item ', String.raw`1\. item `],
    ['1. ', String.raw`1\. `],
    ['word \t ', 'word \t '],
  ])('escapes %j at the end of a paragraph', async (text, markdown) => {
    const { output, reopened } = await serialize((schema) => [
      schema.node('paragraph', null, [schema.text(text)]),
    ])
    expect(output).toBe(`${markdown}\n`)
    expect(reopened.childCount).toBe(1)
    expect(reopened.firstChild!.type.name).toBe('paragraph')
    expect(reopened.textContent).toBe(text.trimEnd())
  })

  // A `#` that only whitespace follows is an ATX closing sequence.
  it('keeps the last `#` of a heading that ends with a space', async () => {
    const { output, reopened } = await serialize((schema) => [
      schema.node('heading', { level: 1 }, [schema.text('Issue # ')]),
    ])
    expect(output).toBe('# Issue \\# \n')
    expect(reopened.firstChild!.type.name).toBe('heading')
    expect(reopened.textContent).toBe('Issue #')
  })

  // An inline hardbreak is a soft break. Two raw spaces before it would
  // make a hard break.
  it.each([
    ['x*  ', String.raw`x\* &#x20;`],
    ['x  ', 'x &#x20;'],
  ])('keeps the soft break after %j', async (text, line) => {
    const { output, reopened } = await serialize((schema) => [
      schema.node('paragraph', null, [
        schema.text(text),
        schema.nodes.hardbreak!.create({ isInline: true }),
        schema.text('y'),
      ]),
    ])
    expect(output).toBe(`${line}\ny\n`)
    const breaks: boolean[] = []
    reopened.descendants((node) => {
      if (node.type.name === 'hardbreak') breaks.push(node.attrs.isInline)
    })
    expect(breaks, output).toEqual([true])
  })

  it('escapes typed text that ends with a space before an italic', async () => {
    const user = userEvent.setup()
    const editor = createEditor()
    await editor.create()

    try {
      const view = editor.ctx.get(editorViewCtx)
      // `[[` types a single `[` in user-event.
      await user.type(view.dom, 'see [[a](b) *y*')

      const markdown = editor.action(getMarkdown())
      expect(markdown).toBe('see \\[a]\\(b) *y*\n')

      const reopened = editor.ctx.get(parserCtx)(markdown)
      expect(reopened.eq(view.state.doc), markdown).toBe(true)
    } finally {
      await editor.destroy()
    }
  })
})
