import type { ResolvedPos } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

export function getDOMByPos(view: EditorView, root: HTMLElement, $pos: ResolvedPos) {
  let el = view.nodeDOM($pos.pos) as HTMLElement | null
  if (!el)
    el = view.nodeDOM($pos.pos - 1) as HTMLElement | null

  let parent = el?.parentElement
  while (parent && parent !== root && $pos.pos === view.posAtDOM(parent, 0)) {
    el = parent
    parent = parent.parentElement
  }

  return el
}
