import type { Ctx } from '@milkdown/ctx'
import type { Fragment, ResolvedPos } from '@milkdown/prose/model'

import { editorViewCtx, parserCtx } from '@milkdown/core'
import { Slice } from '@milkdown/prose/model'

import { markdownToSlice } from './markdown-to-slice'

/// Insert markdown string to the given position.
/// If inline is true, the markdown will be inserted as inline text at `pos`.
/// If inline is false, the markdown will be inserted as block content:
/// - When `pos` is inside a textblock, the content goes after that
///   textblock. If its parent can not hold the content, such as a table
///   cell, the content goes after the nearest ancestor whose parent can.
/// - When `pos` is between blocks, the content goes at `pos`. If the parent
///   there can not hold the content, such as a list or a table, the content
///   goes before that parent when `pos` is at its start, otherwise after it,
///   moving further out until a parent can hold it.
/// - When `pos` is inside an empty top-level textblock, such as the default
///   empty paragraph of a new editor, the content replaces that textblock.
/// A `pos` outside the document throws a `RangeError`.
export function insertPos(
  markdown: string,
  pos: number,
  inline: boolean = false
) {
  return (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx)
    const $pos = view.state.doc.resolve(pos)

    if (inline) {
      const slice = markdownToSlice(markdown)(ctx)
      view.dispatch(view.state.tr.replace(pos, pos, slice))
      return
    }

    const doc = ctx.get(parserCtx)(markdown)
    if (!doc) return
    // Empty markdown parses to a doc holding one empty paragraph.
    const first = doc.firstChild
    if (doc.childCount === 1 && first?.isTextblock && !first.content.size)
      return

    // A closed slice keeps the outer structure of the first and last
    // blocks, so a list or a blockquote is inserted as is.
    const slice = new Slice(doc.content, 0, 0)
    const { parent } = $pos
    if (
      $pos.depth === 1 &&
      parent.isTextblock &&
      !parent.type.spec.code &&
      parent.content.size === 0
    ) {
      view.dispatch(view.state.tr.replace($pos.before(1), $pos.after(1), slice))
      return
    }

    const target = findBlockInsertPos($pos, doc.content)
    view.dispatch(view.state.tr.replace(target, target, slice))
  }
}

/// Find the deepest block boundary near `$pos` whose parent can hold
/// `content`, so the insertion never splits a list or a table. A boundary
/// at the start of a container moves before it, any other moves after it.
function findBlockInsertPos($pos: ResolvedPos, content: Fragment): number {
  const { doc } = $pos
  let $cur = $pos.parent.isTextblock ? doc.resolve($pos.after()) : $pos
  while ($cur.depth > 0) {
    const index = $cur.index()
    if ($cur.parent.canReplace(index, index, content)) break
    $cur = doc.resolve(index === 0 ? $cur.before() : $cur.after())
  }
  return $cur.pos
}
