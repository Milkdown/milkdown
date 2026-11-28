import type { Ctx } from '@milkdown/ctx'

import {
  type MarkdownSourceMeta,
  editorStateOptionsCtx,
  editorViewCtx,
  markdownSourceKey,
  prosePluginsCtx,
  schemaCtx,
  sourceParserCtx,
} from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'

/// Replace all content of the editor with markdown string.
/// If flush is true, the editor state will be re-created.
export function replaceAll(markdown: string, flush = false) {
  return (ctx: Ctx): void => {
    const view = ctx.get(editorViewCtx)
    // The source parser also tells the editor which markdown the new
    // document stands for. A new editor state finds that out on its own.
    // The transaction below has to say it.
    const { doc, source } = ctx.get(sourceParserCtx)(markdown)
    if (!doc) return

    if (!flush) {
      const { state } = view
      const meta: MarkdownSourceMeta = { source }
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
