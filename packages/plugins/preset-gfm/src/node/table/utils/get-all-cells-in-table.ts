import type { Selection } from '@milkdown/prose/state'

import { findTable, TableMap } from '@milkdown/prose/tables'

/// Get all cells in a table.
export function getAllCellsInTable(selection: Selection) {
  const table = findTable(selection.$from)
  if (!table) return

  const map = TableMap.get(table.node)
  const cells = map.cellsInRect({
    left: 0,
    right: map.width,
    top: 0,
    bottom: map.height,
  })
  return cells.map((nodePos) => {
    const node = table.node.nodeAt(nodePos)
    const pos = nodePos + table.start
    return { pos, start: pos + 1, node }
  })
}
