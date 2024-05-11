import type { Mark, Node } from '@milkdown/prose/model'
import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'
import { linkSchema } from '@milkdown/preset-commonmark'
import { linkPreviewTooltip } from './tooltips'

export function findMarkPosition(mark: Mark, node: Node, doc: Node, from: number, to: number) {
  let markPos = { start: -1, end: -1 }
  doc.nodesBetween(from, to, (n, pos) => {
    // stop recursive finding if result is found
    if (markPos.start > -1)
      return false

    if (markPos.start === -1 && mark.isInSet(n.marks) && node === n) {
      markPos = {
        start: pos,
        end: pos + Math.max(n.textContent.length, 1),
      }
    }

    return undefined
  })

  return markPos
}

export function shouldShowPreviewWhenHover(ctx: Ctx, view: EditorView, event: MouseEvent) {
  const $pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
  if (!$pos)
    return

  const { pos } = $pos
  const node = view.state.doc.nodeAt(pos)

  if (!node)
    return

  const mark = node.marks.find(mark => mark.type === linkSchema.mark.type(ctx))
  if (!mark)
    return

  const key = linkPreviewTooltip.pluginKey()
  if (!key)
    return

  return { show: true, pos, node, mark }
}
