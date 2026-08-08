import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { gfm } from '..'

// The strikethrough input rule goes through the same `markRule` helper as the
// CommonMark marks, so it follows the same inline code boundary policy.

async function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  editor.use(gfm)
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

describe('strikethrough input rule around inline code', () => {
  it('keeps delimiters typed inside an existing inline code literal', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '`ab`')
    // put the caret between `a` and `b`, inside the code span
    view.focus()
    moveCaret(editor, 2)
    await user.keyboard('~~x~~')

    expect(editor.action(getMarkdown())).toBe('`a~~x~~b`\n')
  })

  it('still creates a strikethrough around inline code', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()

    await user.type(editor.ctx.get(editorViewCtx).dom, '~~`code`~~')

    expect(editor.action(getMarkdown())).toBe('~~`code`~~\n')
  })

  it('still creates a strikethrough around inline code when the caret moved', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, '~~`code`')
    moveCaret(editor)
    await user.type(view.dom, '~~')

    expect(editor.action(getMarkdown())).toBe('~~`code`~~\n')
  })
})
