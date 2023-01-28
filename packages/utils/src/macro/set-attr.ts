/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import type { Attrs } from '@milkdown/prose/model'

export const setAttr = (pos: number, update: (prevAttrs: Attrs) => Attrs) => (ctx: Ctx) => {
  const view = ctx.get(editorViewCtx)
  const { tr } = view.state
  const node = tr.doc.nodeAt(pos)
  if (!node)
    return
  const nextAttr = update(node.attrs)
  return view.dispatch(tr.setNodeMarkup(pos, undefined, nextAttr))
}
