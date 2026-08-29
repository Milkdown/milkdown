import { defaultValueCtx, Editor, editorViewCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { getMarkdown } from '@milkdown/utils'

import { gfm } from '..'

type EditorPlugins = Parameters<Editor['use']>[0]

/// Create an editor loaded with `defaultValue`. Uses the commonmark and
/// gfm presets unless `plugins` are given, in which case exactly those are
/// used. Callers that keep the editor must destroy it; prefer `withEditor`.
export async function createEditor(
  defaultValue: string,
  ...plugins: EditorPlugins[]
) {
  const editor = Editor.make()
  editor.config((ctx) => {
    ctx.set(defaultValueCtx, defaultValue)
  })
  for (const plugin of plugins.length ? plugins : [commonmark, gfm])
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

// Keep in sync with `isBrHtmlValue` in
// preset-commonmark/src/__internal__/empty-line-br.ts (not exported
// across packages).
const BR_VALUE_PATTERN = /^<br\s*\/?\s*>$/i

/// Load `markdown` and count the html atoms holding a `<br>` in the
/// resulting document.
export function countBrAtomsIn(markdown: string) {
  return withEditor(markdown, (editor) =>
    editor.action((ctx) => {
      const doc = ctx.get(editorViewCtx).state.doc
      let count = 0
      doc.descendants((node) => {
        if (
          node.type.name === 'html' &&
          BR_VALUE_PATTERN.test(String(node.attrs.value).trim())
        )
          count += 1
      })
      return count
    })
  )
}
