import type { Transaction } from '@milkdown/prose/state'

import type { CellSelectionRange } from './types'

import { getCellsInCol } from './get-cells-in-col'
import { getCellsInRow } from './get-cells-in-row'

export function getSelectionRangeInCol(
  tr: Transaction,
  startColIndex: number,
  endColIndex: number = startColIndex
): CellSelectionRange | undefined {
  let startIndex = startColIndex
  let endIndex = endColIndex

  // looking for selection start column (startIndex)
  for (let i = startColIndex; i >= 0; i--) {
    const cells = getCellsInCol(i, tr.selection)
    if (cells) {
      cells.forEach((cell) => {
        const maybeEndIndex = cell.node.attrs.colspan + i - 1
        if (maybeEndIndex >= startIndex) {
          startIndex = i
        }
        if (maybeEndIndex > endIndex) {
          endIndex = maybeEndIndex
        }
      })
    }
  }
  // looking for selection end column (endIndex)
  for (let i = startColIndex; i <= endIndex; i++) {
    const cells = getCellsInCol(i, tr.selection)
    if (cells) {
      cells.forEach((cell) => {
        const maybeEndIndex = cell.node.attrs.colspan + i - 1
        if (cell.node.attrs.colspan > 1 && maybeEndIndex > endIndex) {
          endIndex = maybeEndIndex
        }
      })
    }
  }

  // filter out columns without cells (where all rows have colspan > 1 in the same column)
  const indexes = []
  for (let i = startIndex; i <= endIndex; i++) {
    const maybeCells = getCellsInCol(i, tr.selection)
    if (maybeCells && maybeCells.length > 0) {
      indexes.push(i)
    }
  }
  startIndex = indexes[0]!
  endIndex = indexes[indexes.length - 1]!

  const firstSelectedColumnCells = getCellsInCol(startIndex, tr.selection)
  const firstRowCells = getCellsInRow(0, tr.selection)
  if (!firstSelectedColumnCells || !firstRowCells) {
    return
  }

  const $anchor = tr.doc.resolve(
    firstSelectedColumnCells[firstSelectedColumnCells.length - 1]!.pos
  )

  let headCell
  for (let i = endIndex; i >= startIndex; i--) {
    const columnCells = getCellsInCol(i, tr.selection)
    if (columnCells && columnCells.length > 0) {
      for (let j = firstRowCells.length - 1; j >= 0; j--) {
        if (firstRowCells[j]!.pos === columnCells[0]!.pos) {
          headCell = columnCells[0]
          break
        }
      }
      if (headCell) {
        break
      }
    }
  }
  if (!headCell) {
    return
  }

  const $head = tr.doc.resolve(headCell.pos)
  return { $anchor, $head, indexes }
}
