import type { Ctx } from '@milkdown/ctx'

import {
  documentSerializerCtx,
  editorViewCtx,
  markdownSourceKey,
  schemaCtx,
  serializerCtx,
} from '@milkdown/core'

/// Get content of the editor as markdown string. If range is provided, it will
/// return the markdown string of the range. If range is not provided, it will
/// return the markdown string of the whole document.
///
/// With `preserveSourceCtx` on, the whole document keeps the markdown it
/// was loaded from: all of it while the content is the same, and after an
/// edit every block that did not change.
export function getMarkdown(range?: { from: number; to: number }) {
  return (ctx: Ctx): string => {
    const view = ctx.get(editorViewCtx)
    const state = view.state

    if (!range) {
      const serialize = ctx.get(documentSerializerCtx)
      return serialize(state.doc, markdownSourceKey.getState(state))
    }

    const schema = ctx.get(schemaCtx)
    const serializer = ctx.get(serializerCtx)
    const slice = state.doc.slice(range.from, range.to, true)
    const doc = schema.topNodeType.createAndFill(null, slice.content)
    if (!doc) {
      console.error('No document found')
      return ''
    }
    return serializer(doc)
  }
}
