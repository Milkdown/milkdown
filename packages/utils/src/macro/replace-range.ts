import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx } from '@milkdown/core'

import { markdownToSlice } from './markdown-to-slice'

/// Replace the content of the given range with the markdown string.
export function replaceRange(
  markdown: string,
  range: { from: number; to: number }
) {
  return (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx)
    const slice = markdownToSlice(markdown)(ctx)

    view.dispatch(view.state.tr.replace(range.from, range.to, slice))
  }
}
