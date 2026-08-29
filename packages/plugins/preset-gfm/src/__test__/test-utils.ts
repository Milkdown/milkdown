import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'

import { gfm } from '..'

export async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
  editor.use(gfm)
  await editor.create()
  return editor
}

export async function roundTrip(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.action(getMarkdown())
}

export function countBrAtoms(editor: Editor) {
  return editor.action((ctx) => {
    const doc = ctx.get(editorViewCtx).state.doc
    let count = 0
    doc.descendants((node) => {
      if (node.type.name === 'html' && /<br/i.test(node.attrs.value)) count += 1
    })
    return count
  })
}
