import type { Selection } from '@milkdown/prose/state'

import { findTable, TableMap } from '@milkdown/prose/tables'

import type { CellPos } from './types'

/// Get cells in a column of a table.
export function getCellsInCol(
  columnIndexes: number | number[],
  selection: Selection
): CellPos[] | undefined {
  const table = findTable(selection.$from)
  if (!table) return undefined

  const map = TableMap.get(table.node)
  const indexes = Array.isArray(columnIndexes) ? columnIndexes : [columnIndexes]

  return indexes
    .filter((index) => index >= 0 && index <= map.width - 1)
    .flatMap((index) => {
      const cells = map.cellsInRect({
        left: index,
        right: index + 1,
        top: 0,
        bottom: map.height,
      })
      return cells.map((nodePos) => {
        const node = table.node.nodeAt(nodePos)!
        const pos = nodePos + table.start
        return { pos, start: pos + 1, node, depth: table.depth + 2 }
      })
    })
}
