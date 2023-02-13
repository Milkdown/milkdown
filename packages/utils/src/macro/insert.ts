/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx, parserCtx } from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'

/// Insert markdown string into the editor.
export const insert = (markdown: string) => (ctx: Ctx) => {
  const view = ctx.get(editorViewCtx)
  const parser = ctx.get(parserCtx)
  const doc = parser(markdown)
  if (!doc)
    return

  const contentSlice = view.state.selection.content()
  return view.dispatch(
    view.state.tr
      .replaceSelection(new Slice(doc.content, contentSlice.openStart, contentSlice.openEnd))
      .scrollIntoView(),
  )
}
