import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { CellSelection, TableMap } from '@milkdown/prose/tables'

import { convertRowsToTable } from './convert-rows-to-table'
import { convertTableToRows } from './convert-table-to-rows'
import { findTable } from './find-table'
import { getSelectionRangeInCol } from './get-selection-range-in-col'
import { moveRowInArrayOfRows } from './move-row-in-array-of-rows'
import { transpose } from './transpose'

export interface MoveColParams {
  tr: Transaction
  origin: number
  target: number
  pos: number
  select?: boolean
}

/// If the selection is in a table,
/// Move the columns at `origin` to `target` in current table.
/// The `select` is true by default, which means the selection will be set to the moved column.
export function moveCol(moveColParams: MoveColParams) {
  const { tr, origin, target, select, pos } = moveColParams
  const $pos = tr.doc.resolve(pos)
  const table = findTable($pos)
  if (!table) return false

  const indexesOriginColumn = getSelectionRangeInCol(tr, origin)?.indexes
  const indexesTargetColumn = getSelectionRangeInCol(tr, target)?.indexes

  if (!indexesOriginColumn || !indexesTargetColumn) return false

  if (indexesOriginColumn.includes(target)) return false

  const newTable = moveTableCol(
    table.node,
    indexesOriginColumn,
    indexesTargetColumn,
    0
  )

  tr.replaceWith(table.pos, table.pos + table.node.nodeSize, newTable)

  if (!select) return true

  const map = TableMap.get(newTable)
  const start = table.start
  const index = target
  const lastCell = map.positionAt(map.height - 1, index, newTable)
  const $lastCell = tr.doc.resolve(start + lastCell)

  const firstCell = map.positionAt(0, index, newTable)
  const $firstCell = tr.doc.resolve(start + firstCell)

  tr.setSelection(CellSelection.colSelection($lastCell, $firstCell))
  return true
}

function moveTableCol(
  table: Node,
  indexesOrigin: number[],
  indexesTarget: number[],
  direction: -1 | 1 | 0
) {
  let rows = transpose(convertTableToRows(table))

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction)
  rows = transpose(rows)

  return convertRowsToTable(table, rows)
}
