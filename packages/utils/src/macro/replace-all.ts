import type { Ctx } from '@milkdown/ctx'

import {
  type MarkdownSourceMeta,
  editorStateOptionsCtx,
  editorViewCtx,
  markdownSourceKey,
  parserCtx,
  prosePluginsCtx,
  schemaCtx,
} from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'
import { getParsedSource } from '@milkdown/transformer'

/// Replace all content of the editor with markdown string.
/// If flush is true, the editor state will be re-created.
export function replaceAll(markdown: string, flush = false) {
  return (ctx: Ctx): void => {
    const view = ctx.get(editorViewCtx)
    const parser = ctx.get(parserCtx)
    const doc = parser(markdown)
    if (!doc) return

    if (!flush) {
      const { state } = view
      // The new document is not the parsed node itself, so tell the editor
      // which markdown it stands for. A new editor state finds that out on
      // its own.
      const meta: MarkdownSourceMeta = {
        // A parser that a plugin replaced may not record what it parsed.
        source: getParsedSource(doc) ?? { source: markdown, doc },
      }
      return view.dispatch(
        state.tr
          .replace(0, state.doc.content.size, new Slice(doc.content, 0, 0))
          .setMeta(markdownSourceKey, meta)
      )
    }

    const schema = ctx.get(schemaCtx)
    const overrideOptions = ctx.get(editorStateOptionsCtx)
    const plugins = ctx.get(prosePluginsCtx)
    const newOptions = overrideOptions({
      schema,
      doc,
      plugins,
    })

    const state = EditorState.create(newOptions)

    view.updateState(state)
  }
}
