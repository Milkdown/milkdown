import '@testing-library/jest-dom/vitest'
import { Editor, editorViewCtx } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { commonmark } from '..'

// https://github.com/Milkdown/milkdown/issues/2400
// Two pastes of text that ends with `_`, followed by Space or Enter,
// deleted characters. The underscore-emphasis input rule carried no `$`
// anchor, so its regex matched an `_..._` span across the two pastes and
// ended before the cursor. The prosemirror input-rule runner computes
// the affected range from a match that ends at the cursor, so the
// off-by-one range corrupted the document.

const PASTED = 'This is for qa34%^%^&&&(&(&(&()(*()_'

async function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  await editor.create()
  return editor
}

function hasEmphasis(editor: Editor) {
  const { doc } = editor.ctx.get(editorViewCtx).state
  let found = false
  doc.descendants((node) => {
    if (node.marks.some((mark) => mark.type.name === 'emphasis')) found = true
  })
  return found
}

// Simulate a paste: a single programmatic insertion does not run input rules
// (those only fire from `handleTextInput` / `handleKeyDown`), exactly like a
// real clipboard paste.
function paste(editor: Editor, text: string) {
  const view = editor.ctx.get(editorViewCtx)
  view.dispatch(view.state.tr.insertText(text))
}

describe('pasting special characters (#2400)', () => {
  it('does not delete characters when pressing Space after two pastes', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, PASTED)
    paste(editor, PASTED)

    const before = view.state.doc.textContent
    const end = view.state.selection.from

    // This is the exact call prosemirror-view makes when a space is typed.
    // The trailing `deflt` callback is required by the prop type but unused
    // by the input-rule plugin.
    view.someProp('handleTextInput', (f) =>
      f(view, end, end, ' ', () => view.state.tr)
    )

    expect(view.state.doc.textContent).toBe(before)
    expect(hasEmphasis(editor)).toBe(false)
  })

  it('does not delete characters when pressing Enter after two pastes', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, PASTED)
    paste(editor, PASTED)

    const before = view.state.doc.textContent

    // This is the exact call the custom input-rule plugin makes on Enter.
    const event = new KeyboardEvent('keydown', { key: 'Enter' })
    view.someProp('handleKeyDown', (f) => f(view, event))

    expect(view.state.doc.textContent).toBe(before)
    expect(hasEmphasis(editor)).toBe(false)
  })

  it('still turns _word_ into emphasis when the closing _ is typed', async () => {
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    paste(editor, '_word')

    const end = view.state.selection.from
    view.someProp('handleTextInput', (f) =>
      f(view, end, end, '_', () => view.state.tr)
    )

    expect(view.state.doc.textContent).toBe('word')
    expect(hasEmphasis(editor)).toBe(true)
  })
})

// The `$` anchor added to the underscore rule must not regress typing the
// markdown syntax by hand: these mirror the input-rule e2e tests.
describe('typing underscore emphasis still works', () => {
  it('creates emphasis when typing _on the grass_', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()
    const view = editor.ctx.get(editorViewCtx)

    await user.type(view.dom, 'The lunatic is _on the grass_')

    expect(hasEmphasis(editor)).toBe(true)
    expect(editor.action(getMarkdown())).toBe('The lunatic is _on the grass_\n')
  })

  it('does not create emphasis for intra-word underscores', async () => {
    const user = userEvent.setup()
    const editor = await createEditor()

    await user.type(
      editor.ctx.get(editorViewCtx).dom,
      'the_lunatic_is_on_the_grass'
    )

    expect(hasEmphasis(editor)).toBe(false)
    expect(editor.action(getMarkdown())).toBe(
      'the\\_lunatic\\_is\\_on\\_the\\_grass\n'
    )
  })
})
