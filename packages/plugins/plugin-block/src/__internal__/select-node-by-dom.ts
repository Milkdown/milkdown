import type { EditorView } from '@milkdown/prose/view'

import type { FilterNodes } from '../block-config'
import type { ActiveNode } from '../types'

export function selectRootNodeByDom(view: EditorView, coords: { x: number, y: number }, filterNodes: FilterNodes): ActiveNode | null {
  const root = view.dom.parentElement
  if (!root)
    return null

  try {
    const pos = view.posAtCoords({
      left: coords.x,
      top: coords.y,
    })?.inside
    if (pos == null || pos < 0)
      return null

    let $pos = view.state.doc.resolve(pos)
    let node = view.state.doc.nodeAt(pos)
    let element = view.nodeDOM(pos) as HTMLElement | null

    const filter = (needLookup: boolean) => {
      const checkDepth = $pos.depth >= 1 && $pos.index($pos.depth) === 0
      const shouldLookUp = needLookup || checkDepth

      if (!shouldLookUp)
        return

      const ancestorPos = $pos.before($pos.depth)
      node = view.state.doc.nodeAt(ancestorPos)
      element = view.nodeDOM(ancestorPos) as HTMLElement | null
      $pos = view.state.doc.resolve(ancestorPos)

      if (!filterNodes($pos, node!))
        filter(true)
    }

    // If filterNodes returns false, we should look up the parent node.
    const filterResult = filterNodes($pos, node!)
    filter(!filterResult)

    if (!element || !node)
      return null

    return { node, $pos, el: element }
  }
  catch {
    return null
  }
}
