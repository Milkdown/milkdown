import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { CellSelection, TableMap } from '@milkdown/prose/tables'

import { convertRowsToTable } from './convert-rows-to-table'
import { convertTableToRows } from './convert-table-to-rows'
import { findTable } from './find-table'
import { getSelectionRangeInRow } from './get-selection-range-in-row'
import { moveRowInArrayOfRows } from './move-row-in-array-of-rows'

export interface MoveRowParams {
  tr: Transaction
  origin: number
  target: number
  pos: number
  select?: boolean
}

/// If the selection is in a table,
/// Move the rows at `origin` and `target` in current table.
/// The `select` is true by default, which means the selection will be set to the moved row.
export function moveRow(moveRowParams: MoveRowParams) {
  const { tr, origin, target, select, pos } = moveRowParams
  const $pos = tr.doc.resolve(pos)
  const table = findTable($pos)
  if (!table) return false

  const indexesOriginRow = getSelectionRangeInRow(tr, origin)?.indexes
  const indexesTargetRow = getSelectionRangeInRow(tr, target)?.indexes

  if (!indexesOriginRow || !indexesTargetRow) return false

  if (indexesOriginRow.includes(target)) return false

  const newTable = moveTableRow(
    table.node,
    indexesOriginRow,
    indexesTargetRow,
    0
  )

  tr.replaceWith(table.pos, table.pos + table.node.nodeSize, newTable)

  if (!select) return true

  const map = TableMap.get(newTable)
  const start = table.start
  const index = target
  const lastCell = map.positionAt(index, map.width - 1, newTable)
  const $lastCell = tr.doc.resolve(start + lastCell)

  const firstCell = map.positionAt(index, 0, newTable)
  const $firstCell = tr.doc.resolve(start + firstCell)

  tr.setSelection(CellSelection.rowSelection($lastCell, $firstCell))
  return true
}

function moveTableRow(
  table: Node,
  indexesOrigin: number[],
  indexesTarget: number[],
  direction: -1 | 1 | 0
) {
  let rows = convertTableToRows(table)

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction)

  return convertRowsToTable(table, rows)
}
