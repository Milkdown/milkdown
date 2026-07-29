import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { gfm } from '..'

// https://github.com/Milkdown/milkdown/issues/2400
// The strikethrough input rule shares the same flaw as the underscore-emphasis
// rule: its regex was not anchored to the end of the input (`$`), so pasting
// text that ends with `~` twice and then pressing Space/Enter matched a `~...~`
// span across the two pastes and corrupted the document.

const PASTED = 'qa34 %~'

async function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  editor.use(gfm)
  await editor.create()
  return editor
}

function hasStrikethrough(editor: Editor) {
  const { doc } = editor.ctx.get(editorViewCtx).state
  let found = false
  doc.descendants((node) => {
    if (node.marks.some((mark) => mark.type.name === 'strike_through'))
      found = true
  })
  return found
}

function paste(editor: Editor, text: string) {
  const view = editor.ctx.get(editorViewCtx)
  view.dispatch(view.state.tr.insertText(text))
}

describe('pasting special characters — strikethrough (#2400)', () => {
  it('does not delete characters when pressing Space after two pastes', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, PASTED)
    paste(editor, PASTED)

    const before = view.state.doc.textContent
    const end = view.state.selection.from

    // The trailing `deflt` callback is required by the prop type but unused
    // by the input-rule plugin.
    view.someProp('handleTextInput', (f) =>
      f(view, end, end, ' ', () => view.state.tr)
    )

    expect(view.state.doc.textContent).toBe(before)
    expect(hasStrikethrough(editor)).toBe(false)
  })

  it('does not delete characters when pressing Enter after two pastes', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, PASTED)
    paste(editor, PASTED)

    const before = view.state.doc.textContent

    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    view.someProp('handleKeyDown', (f) => f(view, event))

    expect(view.state.doc.textContent).toBe(before)
    expect(hasStrikethrough(editor)).toBe(false)
  })

  it('still turns ~~word~~ into strikethrough when the closing ~ is typed', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, '~~word~')

    const end = view.state.selection.from
    view.someProp('handleTextInput', (f) =>
      f(view, end, end, '~', () => view.state.tr)
    )

    expect(view.state.doc.textContent).toBe('word')
    expect(hasStrikethrough(editor)).toBe(true)
  })
})

// The `$` anchor added to the strikethrough rule must not regress typing the
// markdown syntax by hand: these mirror the input-rule e2e tests.
describe('typing strikethrough still works', () => {
  it('creates strikethrough when typing ~~on the grass~~', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, 'The lunatic is ~~on the grass~~')

    expect(hasStrikethrough(editor)).toBe(true)
  })

  it('does not create strikethrough for intra-word tildes', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()

    await user.type(
      editor.ctx.get(editorViewCtx).dom,
      'C:/the/~lunatic~/is/on/the/grass'
    )

    expect(hasStrikethrough(editor)).toBe(false)
    expect(editor.action(getMarkdown())).toBe(
      'C:/the/\\~lunatic\\~/is/on/the/grass\n'
    )
  })
})
