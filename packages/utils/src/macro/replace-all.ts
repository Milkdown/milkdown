import type { Ctx } from '@milkdown/ctx'
import {
  editorStateOptionsCtx,
  editorViewCtx,
  parserCtx,
  prosePluginsCtx,
  schemaCtx,
} from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'
import { EditorState } from '@milkdown/prose/state'

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
      return view.dispatch(
        state.tr.replace(
          0,
          state.doc.content.size,
          new Slice(doc.content, 0, 0)
        )
      )
    }

    const schema = ctx.get(schemaCtx)
    const options = ctx.get(editorStateOptionsCtx)
    const plugins = ctx.get(prosePluginsCtx)

    const state = EditorState.create({
      schema,
      doc,
      plugins,
      ...options,
    })

    view.updateState(state)
  }
}
