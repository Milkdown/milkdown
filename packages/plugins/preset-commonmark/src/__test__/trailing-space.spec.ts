import '@testing-library/jest-dom/vitest'
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

describe('trailing whitespace escaping', () => {
  it.each([
    ['see [a](b) ', 'see \\[a]\\(b) *y*\n'],
    ['AT&amp;T ', 'AT\\&amp;T *y*\n'],
    ['a <b>c</b> ', 'a \\<b>c\\</b> *y*\n'],
    ['use `x` ', 'use \\`x\\` *y*\n'],
    ['![a](b) ', '!\\[a]\\(b) *y*\n'],
    ['<https://a.b> ', '\\<https://a.b> *y*\n'],
    ['*em* ', '\\*em\\* *y*\n'],
    ['word\\ ', 'word\\ *y*\n'],
  ])(
    'escapes "%s" before emphasis and round-trips identically',
    async (text, expected) => {
      const editor = createEditor()
      await editor.create()

      const schema = editor.ctx.get(schemaCtx)
      const doc = schema.node('doc', null, [
        schema.node('paragraph', null, [
          schema.text(text),
          schema.text('y', [schema.mark('emphasis')]),
        ]),
      ])

      const saved = editor.ctx.get(serializerCtx)(doc)
      expect(saved).toBe(expected)
      expect(editor.ctx.get(parserCtx)(saved).eq(doc)).toBe(true)
    }
  )

  it.each([
    ['see [a](b) ', 'see \\[a]\\(b) \n'],
    ['# title ', '\\# title \n'],
    ['> quote ', '\\> quote \n'],
    ['- item ', '\\- item \n'],
    ['1. item ', '1\\. item \n'],
    ['word\\ ', 'word\\ \n'],
    ['*em* ', '\\*em\\* \n'],
  ])(
    'escapes syntax in "%s" at paragraph end without converting node type',
    async (text, expected) => {
      const editor = createEditor()
      await editor.create()

      const schema = editor.ctx.get(schemaCtx)
      const doc = schema.node('doc', null, [
        schema.node('paragraph', null, [schema.text(text)]),
      ])

      const saved = editor.ctx.get(serializerCtx)(doc)
      expect(saved).toBe(expected)

      const reopened = editor.ctx.get(parserCtx)(saved)
      expect(reopened.childCount).toBe(1)
      const paragraph = reopened.firstChild!
      expect(paragraph.type.name).toBe('paragraph')
      expect(paragraph.childCount).toBe(1)
      expect(paragraph.firstChild!.isText).toBe(true)
      expect(paragraph.firstChild!.marks).toEqual([])
      expect(paragraph.textContent).toBe(text.trimEnd())
    }
  )

  it('preserves trailing space before strong mark without entity encoding', async () => {
    const editor = createEditor()
    await editor.create()

    const schema = editor.ctx.get(schemaCtx)
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [
        schema.text('word '),
        schema.text('bold', [schema.mark('strong')]),
      ]),
    ])

    const saved = editor.ctx.get(serializerCtx)(doc)
    expect(saved).toBe('word **bold**\n')
    expect(editor.ctx.get(parserCtx)(saved).eq(doc)).toBe(true)
  })
})
