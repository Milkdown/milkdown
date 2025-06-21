import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx, schemaCtx, serializerCtx } from '@milkdown/core'

/// Get content of the editor as markdown string.
/// If range is provided, it will return the markdown string of the range.
/// If range is not provided, it will return the markdown string of the whole document.
export function getMarkdown(range?: { from: number; to: number }) {
  return (ctx: Ctx): string => {
    const view = ctx.get(editorViewCtx)
    const schema = ctx.get(schemaCtx)
    const serializer = ctx.get(serializerCtx)

    if (!range) {
      return serializer(view.state.doc)
    }

    const state = view.state
    const slice = state.doc.slice(range.from, range.to, true)
    const doc = schema.topNodeType.createAndFill(null, slice.content)
    if (!doc) {
      console.error('No document found')
      return ''
    }
    return serializer(doc)
  }
}
