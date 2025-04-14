import type { Ctx } from '@milkdown/ctx'
import type { Attrs } from '@milkdown/prose/model'

import { editorViewCtx } from '@milkdown/core'

/// Set the attributes of the node at the given position.
export function setAttr(pos: number, update: (prevAttrs: Attrs) => Attrs) {
  return (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx)
    const { tr } = view.state
    const node = tr.doc.nodeAt(pos)
    if (!node) return
    const nextAttr = update(node.attrs)
    return view.dispatch(tr.setNodeMarkup(pos, undefined, nextAttr))
  }
}
