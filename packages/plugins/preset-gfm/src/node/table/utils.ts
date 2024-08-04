import type { ContentNodeWithPos } from '@milkdown/prose'
import { cloneTr, findParentNodeClosestToPos } from '@milkdown/prose'
import type { Node, ResolvedPos } from '@milkdown/prose/model'
import type { Selection, Transaction } from '@milkdown/prose/state'
import type { TableRect } from '@milkdown/prose/tables'
import { CellSelection, TableMap } from '@milkdown/prose/tables'

import type { Ctx } from '@milkdown/ctx'
import { tableCellSchema, tableHeaderRowSchema, tableHeaderSchema, tableRowSchema, tableSchema } from './schema'

/// @internal
export interface CellPos {
  pos: number
  start: number
  node: Node
}

/// @internal
export function createTable(ctx: Ctx, rowsCount = 3, colsCount = 3): Node {
  const cells = Array(colsCount)
    .fill(0)
    .map(() => tableCellSchema.type(ctx).createAndFill()!)

  const headerCells = Array(colsCount)
    .fill(0)
    .map(() => tableHeaderSchema.type(ctx).createAndFill()!)

  const rows = Array(rowsCount)
    .fill(0)
    .map((_, i) => i === 0
      ? tableHeaderRowSchema.type(ctx).create(null, headerCells)
      : tableRowSchema.type(ctx).create(null, cells))

  return tableSchema.type(ctx).create(null, rows)
}

/// Find the table node with position information for target pos.
export function findTable($pos: ResolvedPos) {
  return findParentNodeClosestToPos(node => node.type.spec.tableRole === 'table')($pos)
}

/// Get cells in a column of a table.
export function getCellsInCol(columnIndex: number, selection: Selection): CellPos[] | undefined {
  const table = findTable(selection.$from)
  if (!table)
    return undefined
  const map = TableMap.get(table.node)
  if (columnIndex < 0 || columnIndex >= map.width)
    return undefined

  return map
    .cellsInRect({ left: columnIndex, right: columnIndex + 1, top: 0, bottom: map.height })
    .map((pos) => {
      const node = table.node.nodeAt(pos)
      if (!node)
        return undefined
      const start = pos + table.start
      return {
        pos: start,
        start: start + 1,
        node,
      }
    })
    .filter((x): x is CellPos => x != null)
}

/// Get cells in a row of a table.
export function getCellsInRow(rowIndex: number, selection: Selection): CellPos[] | undefined {
  const table = findTable(selection.$from)
  if (!table)
    return undefined
  const map = TableMap.get(table.node)
  if (rowIndex < 0 || rowIndex >= map.height)
    return undefined

  return map
    .cellsInRect({ left: 0, right: map.width, top: rowIndex, bottom: rowIndex + 1 })
    .map((pos) => {
      const node = table.node.nodeAt(pos)
      if (!node)
        return undefined
      const start = pos + table.start
      return {
        pos: start,
        start: start + 1,
        node,
      }
    })
    .filter((x): x is CellPos => x != null)
}

/// Get all cells in a table.
export function getAllCellsInTable(selection: Selection) {
  const table = findTable(selection.$from)
  if (!table)
    return

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

/// @internal
export function addRowWithAlignment(ctx: Ctx, tr: Transaction, { map, tableStart, table }: TableRect, row: number) {
  const rowPos = Array(row)
    .fill(0)
    .reduce((acc, _, i) => {
      return acc + table.child(i).nodeSize
    }, tableStart)

  const cells = Array(map.width)
    .fill(0)
    .map((_, col) => {
      const headerCol = table.nodeAt(map.map[col] as number)
      return tableCellSchema.type(ctx).createAndFill({ alignment: headerCol?.attrs.alignment }) as Node
    })

  tr.insert(rowPos, tableRowSchema.type(ctx).create(null, cells))
  return tr
}

/// @internal
export function selectLine(type: 'row' | 'col') {
  return (index: number, pos?: number) => (tr: Transaction) => {
    pos = pos ?? tr.selection.from
    const $pos = tr.doc.resolve(pos)
    const $node = findParentNodeClosestToPos(node => node.type.name === 'table')($pos)
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
          table.node,
        )
        const $lastCell = tr.doc.resolve(table.from + lastCell)

        const createCellSelection = isRowSelection ? CellSelection.rowSelection : CellSelection.colSelection

        const firstCell = map.positionAt(isRowSelection ? index : 0, isRowSelection ? 0 : index, table.node)
        const $firstCell = tr.doc.resolve(table.from + firstCell)
        return cloneTr(tr.setSelection(createCellSelection($lastCell, $firstCell) as unknown as Selection))
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

function transpose<T>(array: T[][]) {
  return array[0]!.map((_, i) => {
    return array.map(column => column[i])
  }) as T[][]
}

function convertArrayOfRowsToTableNode(tableNode: Node, arrayOfNodes: (Node | null)[][]) {
  const rowsPM = []
  const map = TableMap.get(tableNode)
  for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
    const row = tableNode.child(rowIndex)
    const rowCells = []

    for (let colIndex = 0; colIndex < map.width; colIndex++) {
      if (!arrayOfNodes[rowIndex]![colIndex])
        continue

      const cellPos = map.map[rowIndex * map.width + colIndex]!

      const cell = arrayOfNodes[rowIndex]![colIndex]!
      const oldCell = tableNode.nodeAt(cellPos)!
      const newCell = oldCell.type.createChecked(
        Object.assign({}, cell.attrs),
        cell.content,
        cell.marks,
      )
      rowCells.push(newCell)
    }

    rowsPM.push(row.type.createChecked(row.attrs, rowCells, row.marks))
  }

  const newTable = tableNode.type.createChecked(
    tableNode.attrs,
    rowsPM,
    tableNode.marks,
  )

  return newTable
}

function convertTableNodeToArrayOfRows(tableNode: Node) {
  const map = TableMap.get(tableNode)
  const rows: (Node | null)[][] = []
  for (let rowIndex = 0; rowIndex < map.height; rowIndex++) {
    const rowCells: (Node | null)[] = []
    const seen: Record<number, boolean> = {}

    for (let colIndex = 0; colIndex < map.width; colIndex++) {
      const cellPos = map.map[rowIndex * map.width + colIndex]!
      const cell = tableNode.nodeAt(cellPos)
      const rect = map.findCell(cellPos)
      if (seen[cellPos] || rect.top !== rowIndex) {
        rowCells.push(null)
        continue
      }
      seen[cellPos] = true

      rowCells.push(cell)
    }

    rows.push(rowCells)
  }

  return rows
}

function moveRowInArrayOfRows(rows: (Node | null)[][], indexesOrigin: number[], indexesTarget: number[], directionOverride: -1 | 1 | 0) {
  const direction = indexesOrigin[0]! > indexesTarget[0]! ? -1 : 1

  const rowsExtracted = rows.splice(indexesOrigin[0]!, indexesOrigin.length)
  const positionOffset = rowsExtracted.length % 2 === 0 ? 1 : 0
  let target: number

  if (directionOverride === -1 && direction === 1) {
    target = indexesTarget[0]! - 1
  }
  else if (directionOverride === 1 && direction === -1) {
    target = indexesTarget[indexesTarget.length - 1]! - positionOffset + 1
  }
  else {
    target
      = direction === -1
        ? indexesTarget[0]!
        : indexesTarget[indexesTarget.length - 1]! - positionOffset
  }

  rows.splice(target, 0, ...rowsExtracted)
  return rows
}

function moveTableColumn(table: ContentNodeWithPos, indexesOrigin: number[], indexesTarget: number[], direction: -1 | 1 | 0) {
  let rows = transpose(convertTableNodeToArrayOfRows(table.node))

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction)
  rows = transpose(rows)

  return convertArrayOfRowsToTableNode(table.node, rows)
}

function moveTableRow(table: ContentNodeWithPos, indexesOrigin: number[], indexesTarget: number[], direction: -1 | 1 | 0) {
  let rows = convertTableNodeToArrayOfRows(table.node)

  rows = moveRowInArrayOfRows(rows, indexesOrigin, indexesTarget, direction)

  return convertArrayOfRowsToTableNode(table.node, rows)
}

function getSelectionRangeInColumn(columnIndex: number, tr: Transaction) {
  let startIndex = columnIndex
  let endIndex = columnIndex

  // looking for selection start column (startIndex)
  for (let i = columnIndex; i >= 0; i--) {
    const cells = getCellsInCol(i, tr.selection)
    if (cells) {
      cells.forEach((cell) => {
        const maybeEndIndex = cell.node.attrs.colspan + i - 1
        if (maybeEndIndex >= startIndex)
          startIndex = i

        if (maybeEndIndex > endIndex)
          endIndex = maybeEndIndex
      })
    }
  }
  // looking for selection end column (endIndex)
  for (let i = columnIndex; i <= endIndex; i++) {
    const cells = getCellsInCol(i, tr.selection)
    if (cells) {
      cells.forEach((cell) => {
        const maybeEndIndex = cell.node.attrs.colspan + i - 1
        if (cell.node.attrs.colspan > 1 && maybeEndIndex > endIndex)
          endIndex = maybeEndIndex
      })
    }
  }

  // filter out columns without cells (where all rows have colspan > 1 in the same column)
  const indexes = []
  for (let i = startIndex; i <= endIndex; i++) {
    const maybeCells = getCellsInCol(i, tr.selection)
    if (maybeCells && maybeCells.length)
      indexes.push(i)
  }
  startIndex = indexes[0]!
  endIndex = indexes[indexes.length - 1]!

  const firstSelectedColumnCells = getCellsInCol(startIndex, tr.selection)!
  const firstRowCells = getCellsInRow(0, tr.selection)!
  const $anchor = tr.doc.resolve(
    firstSelectedColumnCells[firstSelectedColumnCells.length - 1]!.pos,
  )

  let headCell: CellPos | undefined
  for (let i = endIndex; i >= startIndex; i--) {
    const columnCells = getCellsInCol(i, tr.selection)
    if (columnCells && columnCells.length) {
      for (let j = firstRowCells.length - 1; j >= 0; j--) {
        if (firstRowCells[j]!.pos === columnCells[0]!.pos) {
          headCell = columnCells[0]
          break
        }
      }
      if (headCell)
        break
    }
  }

  const $head = tr.doc.resolve(headCell!.pos)
  return { $anchor, $head, indexes }
}

function getSelectionRangeInRow(rowIndex: number, tr: Transaction) {
  let startIndex = rowIndex
  let endIndex = rowIndex
  // looking for selection start row (startIndex)
  for (let i = rowIndex; i >= 0; i--) {
    const cells = getCellsInRow(i, tr.selection)
    cells!.forEach((cell) => {
      const maybeEndIndex = cell.node.attrs.rowspan + i - 1
      if (maybeEndIndex >= startIndex)
        startIndex = i

      if (maybeEndIndex > endIndex)
        endIndex = maybeEndIndex
    })
  }
  // looking for selection end row (endIndex)
  for (let i = rowIndex; i <= endIndex; i++) {
    const cells = getCellsInRow(i, tr.selection)
    cells!.forEach((cell) => {
      const maybeEndIndex = cell.node.attrs.rowspan + i - 1
      if (cell.node.attrs.rowspan > 1 && maybeEndIndex > endIndex)
        endIndex = maybeEndIndex
    })
  }

  // filter out rows without cells (where all columns have rowspan > 1 in the same row)
  const indexes = []
  for (let i = startIndex; i <= endIndex; i++) {
    const maybeCells = getCellsInRow(i, tr.selection)
    if (maybeCells && maybeCells.length)
      indexes.push(i)
  }
  startIndex = indexes[0]!
  endIndex = indexes[indexes.length - 1]!

  const firstSelectedRowCells = getCellsInRow(startIndex, tr.selection)!
  const firstColumnCells = getCellsInCol(0, tr.selection)!
  const $anchor = tr.doc.resolve(firstSelectedRowCells[firstSelectedRowCells.length - 1]!.pos)

  let headCell: CellPos | undefined
  for (let i = endIndex; i >= startIndex; i--) {
    const rowCells = getCellsInRow(i, tr.selection)
    if (rowCells && rowCells.length) {
      for (let j = firstColumnCells.length - 1; j >= 0; j--) {
        if (firstColumnCells[j]!.pos === rowCells[0]!.pos) {
          headCell = rowCells[0]!
          break
        }
      }
      if (headCell)
        break
    }
  }

  const $head = tr.doc.resolve(headCell!.pos)
  return { $anchor, $head, indexes }
}

export interface MoveColParams {
  tr: Transaction
  origin: number
  target: number
  select?: boolean
  pos?: number
}

/// If the selection is in a table,
/// Move the columns at `origin` to `target` in current table.
/// The `select` is true by default, which means the selection will be set to the moved column.
export function moveCol(moveColParams: MoveColParams) {
  const { tr, origin, target, select = true, pos } = moveColParams
  const $pos = pos != null ? tr.doc.resolve(pos) : tr.selection.$from
  const table = findTable($pos)
  if (!table)
    return tr

  const { indexes: indexesOriginColumn } = getSelectionRangeInColumn(origin, tr)
  const { indexes: indexesTargetColumn } = getSelectionRangeInColumn(target, tr)

  if (indexesOriginColumn.includes(target))
    return tr

  const newTable = moveTableColumn(
    table,
    indexesOriginColumn,
    indexesTargetColumn,
    0,
  )

  const _tr = cloneTr(tr).replaceWith(
    table.pos,
    table.pos + table.node.nodeSize,
    newTable,
  )

  if (!select)
    return _tr

  const map = TableMap.get(newTable)
  const start = table.start
  const index = target
  const lastCell = map.positionAt(map.height - 1, index, newTable)
  const $lastCell = _tr.doc.resolve(start + lastCell)

  const createCellSelection = CellSelection.colSelection

  const firstCell = map.positionAt(0, index, newTable)
  const $firstCell = _tr.doc.resolve(start + firstCell)

  return _tr.setSelection(createCellSelection($lastCell, $firstCell))
}

export interface MoveRowParams {
  tr: Transaction
  origin: number
  target: number
  select?: boolean
  pos?: number
}

/// If the selection is in a table,
/// Move the rows at `origin` and `target` in current table.
/// The `select` is true by default, which means the selection will be set to the moved row.
export function moveRow(moveRowParams: MoveRowParams) {
  const { tr, origin, target, select = true, pos } = moveRowParams
  const $pos = pos != null ? tr.doc.resolve(pos) : tr.selection.$from
  const table = findTable($pos)
  if (!table)
    return tr

  const { indexes: indexesOriginRow } = getSelectionRangeInRow(origin, tr)
  const { indexes: indexesTargetRow } = getSelectionRangeInRow(target, tr)

  if (indexesOriginRow.includes(target))
    return tr

  const newTable = moveTableRow(
    table,
    indexesOriginRow,
    indexesTargetRow,
    0,
  )

  const _tr = cloneTr(tr).replaceWith(
    table.pos,
    table.pos + table.node.nodeSize,
    newTable,
  )

  if (!select)
    return _tr

  const map = TableMap.get(newTable)
  const start = table.start
  const index = target
  const lastCell = map.positionAt(index, map.width - 1, newTable)
  const $lastCell = _tr.doc.resolve(start + lastCell)

  const createCellSelection = CellSelection.rowSelection

  const firstCell = map.positionAt(index, 0, newTable)
  const $firstCell = _tr.doc.resolve(start + firstCell)

  return _tr.setSelection(createCellSelection($lastCell, $firstCell))
}
