import type { Selection } from '@milkdown/prose/state'

import { findTable, TableMap } from '@milkdown/prose/tables'

import type { CellPos } from './types'

/// Get cells in a row of a table.
export function getCellsInRow(
  rowIndex: number | number[],
  selection: Selection
): CellPos[] | undefined {
  const table = findTable(selection.$from)
  if (!table) {
    return
  }

  const map = TableMap.get(table.node)
  const indexes = Array.isArray(rowIndex) ? rowIndex : [rowIndex]

  return indexes
    .filter((index) => index >= 0 && index <= map.height - 1)
    .flatMap((index) => {
      const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: index,
        bottom: index + 1,
      })
      return cells.map((nodePos) => {
        const node = table.node.nodeAt(nodePos)!
        const pos = nodePos + table.start
        return { pos, start: pos + 1, node, depth: table.depth + 2 }
      })
    })
}
