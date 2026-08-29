import { defaultValueCtx, Editor } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'

import { commonmark } from '..'

type EditorPlugins = Parameters<Editor['use']>[0]

/// Run `fn` against a fresh editor loaded with `defaultValue` and destroy
/// the editor afterwards, even when creation fails. Uses the commonmark
/// preset unless `plugins` are given, in which case exactly those are
/// used.
export async function withEditor<T>(
  defaultValue: string,
  fn: (editor: Editor) => T | Promise<T>,
  ...plugins: EditorPlugins[]
): Promise<T> {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  for (const plugin of plugins.length ? plugins : [commonmark])
    editor.use(plugin)
  try {
    await editor.create()
    return await fn(editor)
  } finally {
    await editor.destroy().catch(() => {})
  }
}

export function roundTrip(markdown: string, ...plugins: EditorPlugins[]) {
  return withEditor(
    markdown,
    (editor) => editor.action(getMarkdown()),
    ...plugins
  )
}
