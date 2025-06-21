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
    const resolved = inline ? toPos.pos : toPos.after(toPos.depth - 1)
    const to = Math.min(Math.max(resolved, min), max)

    view.dispatch(view.state.tr.replace(resolved, to, slice))
  }
}
