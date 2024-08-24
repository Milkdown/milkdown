import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'
import { findParent } from '@milkdown/prose'
import type { Ref } from 'atomico'
import { editorViewCtx } from '@milkdown/core'
import { CellSelection } from '@milkdown/prose/tables'
import { findTable } from '@milkdown/preset-gfm'
import { computePosition } from '@floating-ui/dom'
import type { Ctx } from '@milkdown/ctx'
import type { CellIndex, Refs } from './types'

export function findNodeIndex(parent: Node, child: Node) {
  for (let i = 0; i < parent.childCount; i++) {
    if (parent.child(i) === child)
      return i
  }
  return -1
}

export function findPointerIndex(event: PointerEvent, view?: EditorView): CellIndex | undefined {
  if (!view)
    return

  try {
    const posAtCoords = view.posAtCoords({ left: event.clientX, top: event.clientY })
    if (!posAtCoords)
      return
    const pos = posAtCoords?.inside
    if (pos == null || pos < 0)
      return

    const $pos = view.state.doc.resolve(pos)
    const node = view.state.doc.nodeAt(pos)
    if (!node)
      return

    const cellType = ['table_cell', 'table_header']
    const rowType = ['table_row', 'table_header_row']

    const cell = cellType.includes(node.type.name) ? node : findParent(node => cellType.includes(node.type.name))($pos)?.node
    const row = findParent(node => rowType.includes(node.type.name))($pos)?.node
    const table = findParent(node => node.type.name === 'table')($pos)?.node
    if (!cell || !row || !table)
      return

    const columnIndex = findNodeIndex(row, cell)
    const rowIndex = findNodeIndex(table, row)

    return [rowIndex, columnIndex]
  }
  catch {
    return undefined
  }
}

export function getRelatedDOM(contentWrapperRef: Ref<HTMLDivElement>, [rowIndex, columnIndex]: CellIndex) {
  const content = contentWrapperRef.current
  if (!content)
    return
  const rows = content.querySelectorAll('tr')
  const row = rows[rowIndex]
  if (!row)
    return

  const firstRow = rows[0]
  if (!firstRow)
    return

  const headerCol = firstRow.children[columnIndex]
  if (!headerCol)
    return

  const col = row.children[columnIndex]
  if (!col)
    return

  return {
    row,
    col,
    headerCol,
  }
}

export function recoveryStateBetweenUpdate(
  refs: Refs,
  ctx?: Ctx,
  node?: Node,
) {
  if (!ctx)
    return
  if (!node)
    return
  const { selection } = ctx.get(editorViewCtx).state
  if (!(selection instanceof CellSelection))
    return

  const { $from } = selection
  const table = findTable($from)
  if (!table || table.node !== node)
    return

  if (selection.isColSelection()) {
    const { $head } = selection
    const colIndex = $head.index($head.depth - 1)
    computeColHandlePositionByIndex({
      refs,
      index: [0, colIndex],
      before: (handleDOM) => {
        handleDOM.querySelector('.button-group')?.setAttribute('data-show', 'true')
      },
    })
    return
  }
  if (selection.isRowSelection()) {
    const { $head } = selection
    const rowNode = findParent(node => node.type.name === 'table_row' || node.type.name === 'table_header_row')($head)
    if (!rowNode)
      return
    const rowIndex = findNodeIndex(table.node, rowNode.node)
    computeRowHandlePositionByIndex({
      refs,
      index: [rowIndex, 0],
      before: (handleDOM) => {
        if (rowIndex > 0)
          handleDOM.querySelector('.button-group')?.setAttribute('data-show', 'true')
      },
    })
  }
}

interface ComputeHandlePositionByIndexProps {
  refs: Refs
  index: CellIndex
  before?: (handleDOM: HTMLDivElement) => void
  after?: (handleDOM: HTMLDivElement) => void
}

export function computeColHandlePositionByIndex({
  refs,
  index,
  before,
  after,
}: ComputeHandlePositionByIndexProps) {
  const {
    contentWrapperRef,
    colHandleRef,
    hoverIndex,
  } = refs
  const colHandle = colHandleRef.current
  if (!colHandle)
    return

  hoverIndex.current = index
  const dom = getRelatedDOM(contentWrapperRef, index)
  if (!dom)
    return
  const { headerCol: col } = dom
  colHandle.dataset.show = 'true'
  if (before)
    before(colHandle)
  computePosition(col, colHandle, { placement: 'top' })
    .then(({ x, y }) => {
      Object.assign(colHandle.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
      if (after)
        after(colHandle)
    })
}

export function computeRowHandlePositionByIndex({
  refs,
  index,
  before,
  after,
}: ComputeHandlePositionByIndexProps) {
  const {
    contentWrapperRef,
    rowHandleRef,
    hoverIndex,
  } = refs
  const rowHandle = rowHandleRef.current
  if (!rowHandle)
    return

  hoverIndex.current = index
  const dom = getRelatedDOM(contentWrapperRef, index)
  if (!dom)
    return
  const { row } = dom
  rowHandle.dataset.show = 'true'
  if (before)
    before(rowHandle)
  computePosition(row, rowHandle, { placement: 'left' })
    .then(({ x, y }) => {
      Object.assign(rowHandle.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
      if (after)
        after(rowHandle)
    })
}
