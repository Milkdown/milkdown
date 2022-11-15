/* Copyright 2021, Milkdown by Mirone. */

import { missingRootElement } from '@milkdown/exception'
import { calculateNodePosition } from '@milkdown/prose'
import type { EditorView } from '@milkdown/prose/view'

import type { CellSelection } from '../plugin'

export const calculatePosition = (view: EditorView, dom: HTMLElement) => {
  const { selection } = view.state as unknown as { selection: CellSelection }
  const isCol = selection.isColSelection()
  const isRow = selection.isRowSelection()

  calculateNodePosition(view, dom, (selected, target, parent) => {
    const $editor = dom.parentElement
    if (!$editor)
      throw missingRootElement()

    let left = !isRow
      ? selected.left - parent.left + (selected.width - target.width) / 2
      : selected.left - parent.left - target.width / 2 - 8
    let top = selected.top - parent.top - target.height - (isCol ? 14 : 0) - 14 + $editor.scrollTop

    if (left < 0)
      left = 0

    const maxLeft = $editor.clientWidth - (target.width + 4)
    if (left > maxLeft)
      left = maxLeft

    if (top < $editor.scrollTop)
      top = selected.top - parent.top + 14 + $editor.scrollTop

    return [top, left]
  })
}
