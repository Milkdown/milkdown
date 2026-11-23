import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'

import { markdownToSlice } from './markdown-to-slice'

/// Insert markdown string to the given position.
/// If inline is true, the markdown will be inserted as inline text.
/// If inline is false, the markdown will be inserted as block text.
export function insertPos(
  markdown: string,
  pos: number,
  inline: boolean = false
) {
  return (ctx: Ctx) => {
    const slice = markdownToSlice(markdown)(ctx)
    const view = ctx.get(editorViewCtx)
    const toPos = view.state.doc.resolve(pos)

    const min = 0
    const max = view.state.doc.content.size
    // Block mode inserts after the parent of the textblock holding `pos`.
    // A top-level textblock has no parent but the doc, so insert after the
    // textblock itself. A position between top-level blocks is used as is.
    const resolved =
      inline || toPos.depth === 0
        ? toPos.pos
        : toPos.after(Math.max(toPos.depth - 1, 1))
    const to = Math.min(Math.max(resolved, min), max)

    view.dispatch(view.state.tr.replace(resolved, to, slice))
  }
}
