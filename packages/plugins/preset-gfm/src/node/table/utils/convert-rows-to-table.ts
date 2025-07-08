import type { Node } from '@milkdown/prose/model'

import { TableMap } from '@milkdown/prose/tables'

/// @internal
///
/// Convert an array of rows to a table node.
export function convertRowsToTable(
  tableNode: Node,
  arrayOfNodes: (Node | null)[][]
) {
  const rowsPM = []
  const map = TableMap.get(tableNode)
  for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
    const row = tableNode.child(rowIndex)
    const rowCells = []

    for (let colIndex = 0; colIndex < map.width; colIndex++) {
      if (!arrayOfNodes[rowIndex]![colIndex]) continue

      const cellPos = map.map[rowIndex * map.width + colIndex]!

      const cell = arrayOfNodes[rowIndex]![colIndex]!
      const oldCell = tableNode.nodeAt(cellPos)!
      const newCell = oldCell.type.createChecked(
        Object.assign({}, cell.attrs),
        cell.content,
        cell.marks
      )
      rowCells.push(newCell)
    }

    rowsPM.push(row.type.createChecked(row.attrs, rowCells, row.marks))
  }

  const newTable = tableNode.type.createChecked(
    tableNode.attrs,
    rowsPM,
    tableNode.marks
  )

  return newTable
}
