import { defaultValueCtx, Editor } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'

import { commonmark } from '..'

export async function createEditor(defaultValue: string) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  editor.use(commonmark)
  await editor.create()
  return editor
}

export async function roundTrip(markdown: string) {
  const editor = await createEditor(markdown)
  return editor.action(getMarkdown())
}
