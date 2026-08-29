import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark, isBrHtmlValue } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'

import { gfm } from '..'

type EditorPlugins = Parameters<Editor['use']>[0]

/// Run `fn` against a fresh editor loaded with `defaultValue` and destroy
/// the editor afterwards, even when creation fails. Uses the commonmark
/// and gfm presets unless `plugins` are given, in which case exactly
/// those are used.
export async function withEditor<T>(
  defaultValue: string,
  fn: (editor: Editor) => T | Promise<T>,
  ...plugins: EditorPlugins[]
): Promise<T> {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  for (const plugin of plugins.length ? plugins : [commonmark, gfm])
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

/// Load `markdown` and count the html atoms holding a `<br>` in the
/// resulting document.
export function countBrAtomsIn(markdown: string) {
  return withEditor(markdown, (editor) =>
    editor.action((ctx) => {
      const doc = ctx.get(editorViewCtx).state.doc
      let count = 0
      doc.descendants((node) => {
        if (node.type.name === 'html' && isBrHtmlValue(node.attrs.value))
          count += 1
      })
      return count
    })
  )
}
