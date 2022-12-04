/* Copyright 2021, Milkdown by Mirone. */

import { cloneTr, findParentNode } from '@milkdown/prose'
import type { Node } from '@milkdown/prose/model'
import type { Selection, Transaction } from '@milkdown/prose/state'
import type { TableRect } from '@milkdown/prose/tables'
import { CellSelection, TableMap } from '@milkdown/prose/tables'

import { tableCellSchema, tableHeaderSchema, tableRowSchema, tableSchema } from '.'

export interface CellPos {
  pos: number
  start: number
  node: Node
}

export const createTable = (rowsCount = 3, colsCount = 3): Node => {
  const cells = Array(colsCount)
    .fill(0)
    .map(() => tableCellSchema.type().createAndFill()!)

  const headerCells = Array(colsCount)
    .fill(0)
    .map(() => tableHeaderSchema.type().createAndFill()!)

  const rows = Array(rowsCount)
    .fill(0)
    .map((_, i) => tableRowSchema.type().create(null, i === 0 ? headerCells : cells))

  return tableSchema.type().create(null, rows)
}

export const findTable = (selection: Selection) =>
  findParentNode(node => node.type.spec.tableRole === 'table')(selection)

export const getCellsInColumn = (columnIndex: number, selection: Selection): CellPos[] | undefined => {
  const table = findTable(selection)
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

export const getCellsInRow = (rowIndex: number, selection: Selection): CellPos[] | undefined => {
  const table = findTable(selection)
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

export const getAllCellsInTable = (selection: Selection) => {
  const table = findTable(selection)
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

export const selectTable = (tr: Transaction) => {
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

export function addRowWithAlignment(tr: Transaction, { map, tableStart, table }: TableRect, row: number) {
  const rowPos = Array(row)
    .fill(0)
    .reduce((acc, _, i) => {
      return acc + table.child(i).nodeSize
    }, tableStart)

  const cells = Array(map.width)
    .fill(0)
    .map((_, col) => {
      const headerCol = table.nodeAt(map.map[col] as number)
      return tableCellSchema.type().createAndFill({ alignment: headerCol?.attrs.alignment }) as Node
    })

  tr.insert(rowPos, tableRowSchema.type().create(null, cells))
  return tr
}
