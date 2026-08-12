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

// The input rule leaves the stored marks it found before it ran, which hides an
// inherited code mark until the next selection change resets them to `null`.
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

// https://github.com/Milkdown/milkdown/issues/2447
// A code span is a closed run of literal text, so typing at its end has to
// leave it, whether or not the caret moved in between.
describe('inline code boundary (#2447)', () => {
  it('types plain text after a code span', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`code`')
    await user.type(view.dom, 'tail')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['code'])
    expect(editor.action(getMarkdown())).toBe('`code`tail\n')
  })

  it('types plain text after a code span when the caret moved', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`code`')
    moveCaret(editor)
    await user.type(view.dom, 'tail')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['code'])
    expect(editor.action(getMarkdown())).toBe('`code`tail\n')
  })

  it('still extends the span when typing inside it', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`code`')
    view.focus()
    // put the caret between `cod` and `e`, inside the code span
    moveCaret(editor, 4)
    await user.keyboard('x')

    expect(textWithMark(editor, 'inlineCode')).toEqual(['codxe'])
    expect(editor.action(getMarkdown())).toBe('`codxe`\n')
  })
})
