import type { Transaction } from '@milkdown/prose/state'

import { cloneTr } from '@milkdown/prose'
import { CellSelection } from '@milkdown/prose/tables'

import { getAllCellsInTable } from './get-all-cells-in-table'

/// Select a possible table in current selection.
export function selectTable(tr: Transaction) {
  const cells = getAllCellsInTable(tr.selection)
  if (cells && cells[0]) {
    const $firstCell = tr.doc.resolve(cells[0].pos)
    const last = cells[cells.length - 1]
    if (last) {
      const $lastCell = tr.doc.resolve(last.pos)
      return cloneTr(tr.setSelection(new CellSelection($lastCell, $firstCell)))
    }
  }
  return tr
}
