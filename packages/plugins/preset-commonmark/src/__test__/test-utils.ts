import { defaultValueCtx, Editor } from '@milkdown/core'
import { getMarkdown } from '@milkdown/utils'

import { commonmark } from '..'

type EditorPlugins = Parameters<Editor['use']>[0]

/// Create an editor loaded with `defaultValue`. Uses the commonmark preset
/// unless `plugins` are given, in which case exactly those are used.
/// Callers that keep the editor must destroy it; prefer `withEditor`.
export async function createEditor(
  defaultValue: string,
  ...plugins: EditorPlugins[]
) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  for (const plugin of plugins.length ? plugins : [commonmark])
    editor.use(plugin)
  await editor.create()
  return editor
}

/// Run `fn` against a fresh editor and destroy the editor afterwards.
export async function withEditor<T>(
  defaultValue: string,
  fn: (editor: Editor) => T | Promise<T>,
  ...plugins: EditorPlugins[]
): Promise<T> {
  const editor = await createEditor(defaultValue, ...plugins)
  try {
    return await fn(editor)
  } finally {
    await editor.destroy()
  }
}

export function roundTrip(markdown: string, ...plugins: EditorPlugins[]) {
  return withEditor(
    markdown,
    (editor) => editor.action(getMarkdown()),
    ...plugins
  )
}
