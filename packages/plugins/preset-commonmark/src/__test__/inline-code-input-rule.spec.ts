import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { TextSelection } from '@milkdown/prose/state'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'

async function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  await editor.create()
  return editor
}

// Moving the caret drops the stored marks, so the input rule can no longer rely
// on them to tell whether the next character lands inside an inline code span.
function moveCaret(editor: Editor, pos?: number) {
  const view = editor.ctx.get(editorViewCtx)
  const { state } = view
  view.dispatch(
    state.tr.setSelection(
      TextSelection.create(state.doc, pos ?? state.selection.from)
    )
  )
}

function textWithMark(editor: Editor, markName: string) {
  const result: string[] = []
  editor.ctx.get(editorViewCtx).state.doc.descendants((node) => {
    if (node.marks.some((mark) => mark.type.name === markName))
      result.push(node.text ?? '')
  })
  return result
}

describe('mark input rules around inline code', () => {
  it('does not use a delimiter from inline code to create emphasis', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`*_mm`and`*')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['*_mm'])
    expect(textWithMark(editor, 'emphasis')).toEqual([])

    await user.type(view.dom, '_nn`')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['*_mm', '*_nn'])
    expect(textWithMark(editor, 'emphasis')).toEqual([])
    expect(editor.action(getMarkdown())).toBe('`*_mm`and`*_nn`\n')
  })

  it('keeps delimiters typed inside an existing inline code literal', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`ab`')
    // put the caret between `a` and `b`, inside the code span
    view.focus()
    moveCaret(editor, 2)
    await user.keyboard('*x*')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['a*x*b'])
    expect(textWithMark(editor, 'emphasis')).toEqual([])
    expect(editor.action(getMarkdown())).toBe('`a*x*b`\n')
  })

  it.each([
    '*`code`*',
    '**`code`**',
    '*a `code` b*',
    '_`code`_',
    '__`code`__',
    '_a `code` b_',
  ])('still creates an outer mark for %s', async (markdown) => {
    const user = userEvent.setup()
    const editor = await createEditor()

    await user.type(editor.ctx.get(editorViewCtx).dom, markdown)

    expect(editor.action(getMarkdown())).toBe(`${markdown}\n`)
  })

  it.each([
    ['*`code`', '*'],
    ['_`code`', '_'],
  ])(
    'still creates an outer mark for %s%s when the caret moved',
    async (typed, closingDelimiter) => {
      const user = userEvent.setup()
      const editor = await createEditor()
      const view = editor.ctx.get(editorViewCtx)

      await user.type(view.dom, typed)
      moveCaret(editor)
      await user.type(view.dom, closingDelimiter)

      expect(textWithMark(editor, 'inlineCode')).toEqual(['code'])
      expect(editor.action(getMarkdown())).toBe(`${typed}${closingDelimiter}\n`)
    }
  )

  // The inline code mark is inclusive, so once the caret has moved, the first
  // half of a two character delimiter typed at the end of a code span joins that
  // span. It is then literal code content, and closing the mark would delete it.
  it.each([
    ['**`code`', '**'],
    ['__`code`', '__'],
  ])(
    'keeps %s%s literal when the caret moved',
    async (typed, closingDelimiter) => {
      const user = userEvent.setup()
      const editor = await createEditor()
      const view = editor.ctx.get(editorViewCtx)

      await user.type(view.dom, typed)
      moveCaret(editor)
      await user.type(view.dom, closingDelimiter)

      expect(textWithMark(editor, 'inlineCode')).toEqual([
        `code${closingDelimiter}`,
      ])
      expect(textWithMark(editor, 'strong')).toEqual([])
    }
  )

  it.each([
    ['`foo*`bar*', 'foo*'],
    ['`foo~~`bar~~', 'foo~~'],
  ])(
    'keeps the code span intact when its last character is a delimiter (%s)',
    async (typed, code) => {
      const user = userEvent.setup()
      const editor = await createEditor()

      await user.type(editor.ctx.get(editorViewCtx).dom, typed)

      expect(textWithMark(editor, 'inlineCode')).toEqual([code])
      expect(textWithMark(editor, 'emphasis')).toEqual([])
    }
  )

  it('keeps a code span whose last character closes a delimiter pair', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()

    await user.type(editor.ctx.get(editorViewCtx).dom, '**bar`x*`*')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['x*'])
    expect(textWithMark(editor, 'strong')).toEqual([])
  })
})
