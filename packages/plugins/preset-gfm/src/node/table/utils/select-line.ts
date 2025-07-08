import type { Selection, Transaction } from '@milkdown/prose/state'

import { cloneTr, findParentNodeClosestToPos } from '@milkdown/prose'
import { CellSelection, TableMap } from '@milkdown/prose/tables'

/// @internal
export function selectLine(type: 'row' | 'col') {
  return (index: number, pos?: number) => (tr: Transaction) => {
    pos = pos ?? tr.selection.from
    const $pos = tr.doc.resolve(pos)
    const $node = findParentNodeClosestToPos(
      (node) => node.type.name === 'table'
    )($pos)
    const table = $node
      ? {
          node: $node.node,
          from: $node.start,
        }
      : undefined

    const isRowSelection = type === 'row'
    if (table) {
      const map = TableMap.get(table.node)

      // Check if the index is valid
      if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
        const lastCell = map.positionAt(
          isRowSelection ? index : map.height - 1,
          isRowSelection ? map.width - 1 : index,
          table.node
        )
        const $lastCell = tr.doc.resolve(table.from + lastCell)

        const createCellSelection = isRowSelection
          ? CellSelection.rowSelection
          : CellSelection.colSelection

        const firstCell = map.positionAt(
          isRowSelection ? index : 0,
          isRowSelection ? 0 : index,
          table.node
        )
        const $firstCell = tr.doc.resolve(table.from + firstCell)
        return cloneTr(
          tr.setSelection(
            createCellSelection($lastCell, $firstCell) as unknown as Selection
          )
        )
      }
    }
    return tr
  }
}

/// If the selection is in a table,
/// select the {index} row.
export const selectRow = selectLine('row')

/// If the selection is in a table,
/// select the {index} column.
export const selectCol = selectLine('col')
