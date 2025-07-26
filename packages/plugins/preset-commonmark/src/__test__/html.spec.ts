import '@testing-library/jest-dom/vitest'
import type { EditorView } from '@milkdown/prose/view'

import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { expect, it } from 'vitest'

import { commonmark } from '..'

function createEditor() {
  const editor = Editor.make()
  editor.use(commonmark)
  return editor
}

const htmlInBlockquote = {
  name: 'htmlInBlockquote',
  defaultValue: `
> <p>Hello, world!</p>
`,
  check: (view: EditorView) => {
    expect(view.dom.querySelector('blockquote')).toBeInTheDocument()
  },
}

const htmlInListItem = {
  name: 'htmlInListItem',
  defaultValue: `
* <p>List item with HTML</p>
`,
  check: (view: EditorView) => {
    expect(view.dom.querySelector('li')).toBeInTheDocument()
  },
}

;[htmlInBlockquote, htmlInListItem].forEach(({ name, defaultValue, check }) => {
  it(`should render html in ${name}`, async () => {
    const editor = createEditor()
    editor.config((ctx) => {
      ctx.set(defaultValueCtx, defaultValue)
    })

    await editor.create()

    check(editor.ctx.get(editorViewCtx))
  })
})
