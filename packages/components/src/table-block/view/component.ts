import type { Component } from 'atomico'
import { c, html, useCallback, useEffect, useHost, useLayoutEffect, useMemo, useRef } from 'atomico'
import { computePosition, offset } from '@floating-ui/dom'
import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'
import { findParent } from '@milkdown/prose'
import throttle from 'lodash.throttle'
import type { Ctx } from '@milkdown/ctx'
import { commandsCtx, editorViewCtx } from '@milkdown/core'
import {
  addColAfterCommand,
  addColBeforeCommand,
  addRowAfterCommand,
  addRowBeforeCommand,
  deleteSelectedCellsCommand,
  findTable,
  moveColCommand,
  moveRowCommand,
  selectColCommand,
  selectRowCommand,
  setAlignCommand,
} from '@milkdown/preset-gfm'
import { CellSelection } from '@milkdown/prose/tables'

export interface TableComponentProps {
  view: EditorView
  ctx: Ctx
  getPos: () => number | undefined
  node: Node
}

type CellIndex = [row: number, col: number]

export const tableComponent: Component<TableComponentProps> = ({
  view,
  ctx,
  getPos,
  node,
}) => {
  const host = useHost()
  const root = useMemo(() => host.current.getRootNode() as HTMLElement, [host])
  const contentWrapperRef = useRef<HTMLDivElement>()
  const colHandleRef = useRef<HTMLDivElement>()
  const rowHandleRef = useRef<HTMLDivElement>()
  const xLineHandleRef = useRef<HTMLDivElement>()
  const yLineHandleRef = useRef<HTMLDivElement>()
  const tableWrapperRef = useRef<HTMLDivElement>()
  const dragPreviewRef = useRef<HTMLDivElement>()
  const hoverIndex = useRef<CellIndex>([0, 0])
  const lineHoverIndex = useRef<CellIndex>([-1, -1])
  const dragInfo = useRef<{
    startCoords: [x: number, y: number]
    startIndex: number
    endIndex: number
    type: 'row' | 'col'
  }>()

  const getRelatedDOM = useCallback(([rowIndex, columnIndex]: CellIndex) => {
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
  }, [])

  useLayoutEffect(() => {
    const current = contentWrapperRef.current
    if (!current)
      return

    const contentDOM = host.current.querySelector('[data-content-dom]')

    if (contentDOM)
      current.appendChild(contentDOM)

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
      const index: CellIndex = [0, colIndex]
      hoverIndex.current = index
      const colHandle = colHandleRef.current
      if (!colHandle)
        return
      const dom = getRelatedDOM(index)
      if (!dom)
        return
      const {
        headerCol: col,
      } = dom
      colHandle.dataset.show = 'true'
      colHandle.querySelector('.button-group')?.setAttribute('data-show', 'true')
      computePosition(col, colHandle, { placement: 'top' }).then(({ x, y }) => {
        Object.assign(colHandle.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
      return
    }
    if (selection.isRowSelection()) {
      const { $head } = selection
      const rowNode = findParent(node => node.type.name === 'table_row' || node.type.name === 'table_header_row')($head)
      if (!rowNode)
        return
      const rowIndex = findIndex(table.node, rowNode.node)
      const index: CellIndex = [rowIndex, 0]
      hoverIndex.current = index
      const rowHandle = rowHandleRef.current
      if (!rowHandle)
        return
      const dom = getRelatedDOM(index)
      if (!dom)
        return
      const {
        row,
      } = dom
      rowHandle.dataset.show = 'true'
      rowHandle.querySelector('.button-group')?.setAttribute('data-show', 'true')
      computePosition(row, rowHandle, { placement: 'left' }).then(({ x, y }) => {
        Object.assign(rowHandle.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
      })
    }
  }, [])

  const pointerMove = useCallback(throttle((e: PointerEvent) => {
    const index = findPointerIndex(e, view)

    if (!index)
      return

    const dom = getRelatedDOM(index)
    if (!dom)
      return

    const yHandle = yLineHandleRef.current
    if (!yHandle)
      return
    const xHandle = xLineHandleRef.current
    if (!xHandle)
      return
    const content = contentWrapperRef.current
    if (!content)
      return
    const rowHandle = rowHandleRef.current
    if (!rowHandle)
      return
    const colHandle = colHandleRef.current
    if (!colHandle)
      return

    const [rowIndex, colIndex] = index
    const boundary = dom.col.getBoundingClientRect()
    const closeToBoundaryLeft = Math.abs(e.clientX - boundary.left) < 8
    const closeToBoundaryRight = Math.abs(boundary.right - e.clientX) < 8
    const closeToBoundaryTop = Math.abs(e.clientY - boundary.top) < 8
    const closeToBoundaryBottom = Math.abs(boundary.bottom - e.clientY) < 8

    const closeToBoundary = closeToBoundaryLeft || closeToBoundaryRight || closeToBoundaryTop || closeToBoundaryBottom

    const rowButtonGroup = rowHandle.querySelector<HTMLElement>('.button-group')
    const colButtonGroup = colHandle.querySelector<HTMLElement>('.button-group')
    if (rowButtonGroup)
      rowButtonGroup.dataset.show = 'false'
    if (colButtonGroup)
      colButtonGroup.dataset.show = 'false'

    if (closeToBoundary) {
      const contentBoundary = content.getBoundingClientRect()
      rowHandle.dataset.show = 'false'
      colHandle.dataset.show = 'false'

      const yHandleWidth = yHandle.getBoundingClientRect().width
      const xHandleHeight = xHandle.getBoundingClientRect().height

      if (closeToBoundaryLeft || closeToBoundaryRight) {
        lineHoverIndex.current![1] = closeToBoundaryLeft ? colIndex : colIndex + 1
        computePosition(dom.col, yHandle, {
          placement: closeToBoundaryLeft ? 'left' : 'right',
          middleware: [offset(closeToBoundaryLeft ? -1 * yHandleWidth : 0)],
        })
          .then(({ x }) => {
            yHandle.dataset.show = 'true'
            Object.assign(yHandle.style, {
              height: `${contentBoundary.height}px`,
              left: `${x}px`,
            })
          })
      }
      else {
        yHandle.dataset.show = 'false'
      }

      if (index[0] !== 0 && (closeToBoundaryTop || closeToBoundaryBottom)) {
        lineHoverIndex.current![0] = closeToBoundaryTop ? rowIndex : rowIndex + 1
        computePosition(dom.row, xHandle, {
          placement: closeToBoundaryTop ? 'top' : 'bottom',
          middleware: [offset(closeToBoundaryTop ? -1 * xHandleHeight : 0)],
        })
          .then(({ y }) => {
            xHandle.dataset.show = 'true'
            Object.assign(xHandle.style, {
              width: `${contentBoundary.width}px`,
              top: `${y}px`,
            })
          })
      }
      else {
        xHandle.dataset.show = 'false'
      }

      return
    }

    lineHoverIndex.current = [-1, -1]

    yHandle.dataset.show = 'false'
    xHandle.dataset.show = 'false'
    rowHandle.dataset.show = 'true'
    colHandle.dataset.show = 'true'

    const {
      row,
      headerCol: col,
    } = dom
    computePosition(row, rowHandle, { placement: 'left' }).then(({ x, y }) => {
      rowHandle.dataset.show = 'true'
      Object.assign(rowHandle.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
    computePosition(col, colHandle, { placement: 'top' }).then(({ x, y }) => {
      colHandle.dataset.show = 'true'
      Object.assign(colHandle.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
    hoverIndex.current = index
  }, 200), [])

  const pointerLeave = useCallback(() => {
    setTimeout(() => {
      const rowHandle = rowHandleRef.current
      if (!rowHandle)
        return
      const colHandle = colHandleRef.current
      if (!colHandle)
        return
      const yHandle = yLineHandleRef.current
      if (!yHandle)
        return
      const xHandle = xLineHandleRef.current
      if (!xHandle)
        return

      rowHandle.dataset.show = 'false'
      colHandle.dataset.show = 'false'
      yHandle.dataset.show = 'false'
      xHandle.dataset.show = 'false'
    }, 200)
  }, [])

  const dragRow = useCallback((event: DragEvent) => {
    const preview = dragPreviewRef.current
    if (!preview)
      return
    const wrapper = tableWrapperRef.current
    if (!wrapper)
      return
    const content = contentWrapperRef.current
    if (!content)
      return
    const previewRoot = preview.querySelector('tbody')
    if (!previewRoot)
      return

    const [rowIndex] = hoverIndex.current!

    dragInfo.current = {
      startCoords: [event.clientX, event.clientY],
      startIndex: rowIndex,
      endIndex: rowIndex,
      type: 'row',
    }
    preview.dataset.direction = 'vertical'

    const rows = content.querySelectorAll('tr')
    while (previewRoot.firstChild)
      previewRoot.removeChild(previewRoot.firstChild)

    const row = rows[rowIndex]
    if (!row)
      return

    previewRoot.appendChild(row.cloneNode(true))
    const height = row.getBoundingClientRect().height

    const { width } = content.querySelector('tbody')!.getBoundingClientRect()
    Object.assign(preview.style, {
      width: `${width}px`,
      height: `${height}px`,
    })

    preview.dataset.show = 'true'
  }, [])

  const dragCol = useCallback((event: DragEvent) => {
    const preview = dragPreviewRef.current
    if (!preview)
      return
    const wrapper = tableWrapperRef.current
    if (!wrapper)
      return
    const content = contentWrapperRef.current
    if (!content)
      return
    const previewRoot = preview.querySelector('tbody')
    if (!previewRoot)
      return
    if (!ctx)
      return

    const [_, colIndex] = hoverIndex.current!

    dragInfo.current = {
      startCoords: [event.clientX, event.clientY],
      startIndex: colIndex,
      endIndex: colIndex,
      type: 'col',
    }
    preview.dataset.direction = 'horizontal'

    const rows = content.querySelectorAll('tr')
    while (previewRoot.firstChild)
      previewRoot.removeChild(previewRoot.firstChild)

    let width: number | undefined

    Array.from(rows).forEach((row) => {
      const col = row.children[colIndex]
      if (!col)
        return

      if (width === undefined)
        width = col.getBoundingClientRect().width

      const tr = col.parentElement!.cloneNode(false)
      const clone = col.cloneNode(true)
      tr.appendChild(clone)
      previewRoot.appendChild(tr)
    })

    const { height } = content.querySelector('tbody')!.getBoundingClientRect()
    Object.assign(preview.style, {
      width: `${width}px`,
      height: `${height}px`,
    })

    preview.dataset.show = 'true'
  }, [])

  useEffect(() => {
    const onDragEnd = () => {
      const preview = dragPreviewRef.current
      if (!preview)
        return

      if (preview.dataset.show === 'false')
        return

      const previewRoot = preview?.querySelector('tbody')

      while (previewRoot?.firstChild)
        previewRoot?.removeChild(previewRoot.firstChild)

      if (preview)
        preview.dataset.show = 'false'
    }

    const onDrop = () => {
      const preview = dragPreviewRef.current
      if (!preview)
        return
      const yHandle = yLineHandleRef.current
      if (!yHandle)
        return
      const xHandle = xLineHandleRef.current
      if (!xHandle)
        return
      const info = dragInfo.current
      if (!info)
        return
      if (!ctx)
        return
      if (preview.dataset.show === 'false')
        return

      yHandle.dataset.show = 'false'
      xHandle.dataset.show = 'false'

      if (info.startIndex === info.endIndex)
        return

      const commands = ctx.get(commandsCtx)
      const payload = {
        from: info.startIndex,
        to: info.endIndex,
        pos: (getPos?.() ?? 0) + 1,
      }
      if (info.type === 'col')
        commands.call(moveColCommand.key, payload)
      else
        commands.call(moveRowCommand.key, payload)
    }

    root.addEventListener('dragend', onDragEnd)
    root.addEventListener('drop', onDrop)
    return () => {
      root.removeEventListener('dragend', onDragEnd)
      root.removeEventListener('drop', onDrop)
    }
  }, [])

  useEffect(() => {
    const onDragOver = throttle((e: DragEvent) => {
      const preview = dragPreviewRef.current
      if (!preview)
        return
      if (preview.dataset.show === 'false')
        return
      const content = contentWrapperRef.current
      if (!content)
        return
      const wrapperRoot = content.querySelector('tbody')
      if (!wrapperRoot)
        return
      const dom = getRelatedDOM(hoverIndex.current!)
      if (!dom)
        return
      const firstRow = wrapperRoot.querySelector('tr')
      if (!firstRow)
        return
      const xHandle = xLineHandleRef.current
      if (!xHandle)
        return
      const yHandle = yLineHandleRef.current
      if (!yHandle)
        return
      const info = dragInfo.current
      if (!info)
        return

      const wrapperOffsetTop = (wrapperRoot.offsetParent as HTMLElement).offsetTop
      const wrapperOffsetLeft = (wrapperRoot.offsetParent as HTMLElement).offsetLeft

      if (info.type === 'col') {
        const width = dom.col.getBoundingClientRect().width
        const left = wrapperRoot.getBoundingClientRect().left
        const previewLeft = e.clientX + wrapperOffsetLeft - left - width / 2
        const previewRight = e.clientX + wrapperOffsetLeft - left + width / 2

        const [startX] = info.startCoords
        const direction = startX < e.clientX ? 'right' : 'left'

        preview.style.top = `${wrapperOffsetTop}px`
        preview.style.left = `${previewLeft}px`

        const children = Array.from(firstRow.children)
        const col = children.find((col, index) => {
          const boundary = col.getBoundingClientRect()
          const boundaryLeft = boundary.left + wrapperOffsetLeft - left
          const boundaryRight = boundary.right + wrapperOffsetLeft - left
          if (direction === 'right') {
            if (boundaryLeft <= previewRight && boundaryRight >= previewRight)
              return true
            if (index === firstRow.children.length - 1 && previewRight > boundaryRight)
              return true
          }
          else {
            if (boundaryLeft <= previewLeft && boundaryRight >= previewLeft)
              return true
            if (index === 0 && previewLeft < boundaryLeft)
              return true
          }

          return false
        })
        if (col) {
          const yHandleWidth = yHandle.getBoundingClientRect().width
          const contentBoundary = content.getBoundingClientRect()
          const index = children.indexOf(col)
          info.endIndex = index

          computePosition(col, yHandle, {
            placement: direction === 'left' ? 'left' : 'right',
            middleware: [offset(direction === 'left' ? -1 * yHandleWidth : 0)],
          })
            .then(({ x }) => {
              yHandle.dataset.show = 'true'
              Object.assign(yHandle.style, {
                height: `${contentBoundary.height}px`,
                left: `${x}px`,
                top: `${wrapperOffsetTop}px`,
              })
            })
        }
      }
      else if (info.type === 'row') {
        const height = dom.row.getBoundingClientRect().height
        const top = wrapperRoot.getBoundingClientRect().top

        const previewTop = e.clientY - top + wrapperOffsetTop - height / 2
        const previewBottom = e.clientY - top + wrapperOffsetTop + height / 2

        const [_, startY] = info.startCoords
        const direction = startY < e.clientY ? 'down' : 'up'

        preview.style.top = `${previewTop}px`
        preview.style.left = `${wrapperOffsetLeft}px`

        const rows = Array.from(wrapperRoot.querySelectorAll('tr'))
        const row = rows.find((row, index) => {
          const boundary = row.getBoundingClientRect()
          const boundaryTop = boundary.top + wrapperOffsetTop - top
          const boundaryBottom = boundary.bottom + wrapperOffsetTop - top
          if (direction === 'down') {
            if (boundaryTop <= previewBottom && boundaryBottom >= previewBottom)
              return true
            if (index === rows.length - 1 && previewBottom > boundaryBottom)
              return true
          }
          else {
            if (boundaryTop <= previewTop && boundaryBottom >= previewTop)
              return true
            if (index === 0 && previewTop < boundaryTop)
              return true
          }
          return false
        })
        if (row) {
          const xHandleHeight = xHandle.getBoundingClientRect().height
          const contentBoundary = content.getBoundingClientRect()
          const index = rows.indexOf(row)
          info.endIndex = index

          computePosition(row, xHandle, {
            placement: direction === 'up' ? 'top' : 'bottom',
            middleware: [offset(direction === 'up' ? -1 * xHandleHeight : 0)],
          })
            .then(({ y }) => {
              xHandle.dataset.show = 'true'
              Object.assign(xHandle.style, {
                width: `${contentBoundary.width}px`,
                top: `${y}px`,
              })
            })
        }
      }
    }, 20)

    root.addEventListener('dragover', onDragOver)
    return () => {
      root.removeEventListener('dragover', onDragOver)
    }
  }, [])

  const onAddRow = useCallback(() => {
    if (!ctx)
      return
    const xHandle = xLineHandleRef.current
    if (!xHandle)
      return

    const [rowIndex] = lineHoverIndex.current!
    if (rowIndex < 0)
      return

    const rows = Array.from(contentWrapperRef.current?.querySelectorAll('tr') ?? [])
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    if (rows.length === rowIndex) {
      commands.call(selectRowCommand.key, { pos, index: rowIndex - 1 })
      commands.call(addRowAfterCommand.key)
    }
    else {
      commands.call(selectRowCommand.key, { pos, index: rowIndex })
      commands.call(addRowBeforeCommand.key)
    }

    commands.call(selectRowCommand.key, { pos, index: rowIndex })
    xHandle.dataset.show = 'false'
  }, [])

  const onAddCol = useCallback(() => {
    if (!ctx)
      return
    const xHandle = xLineHandleRef.current
    if (!xHandle)
      return

    const [_, colIndex] = lineHoverIndex.current!
    if (colIndex < 0)
      return

    const cols = Array.from(contentWrapperRef.current?.querySelector('tr')?.children ?? [])
    const commands = ctx.get(commandsCtx)

    const pos = (getPos?.() ?? 0) + 1
    if (cols.length === colIndex) {
      commands.call(selectColCommand.key, { pos, index: colIndex - 1 })
      commands.call(addColAfterCommand.key)
    }
    else {
      commands.call(selectColCommand.key, { pos, index: colIndex })
      commands.call(addColBeforeCommand.key)
    }

    commands.call(selectColCommand.key, { pos, index: colIndex })
  }, [])

  const selectCol = useCallback(() => {
    if (!ctx)
      return
    const [_, colIndex] = hoverIndex.current!
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    commands.call(selectColCommand.key, { pos, index: colIndex })
    const buttonGroup = colHandleRef.current?.querySelector<HTMLElement>('.button-group')
    if (buttonGroup)
      buttonGroup.dataset.show = buttonGroup.dataset.show === 'true' ? 'false' : 'true'
  }, [])

  const selectRow = useCallback(() => {
    if (!ctx)
      return
    const [rowIndex, _] = hoverIndex.current!
    const commands = ctx.get(commandsCtx)
    const pos = (getPos?.() ?? 0) + 1
    commands.call(selectRowCommand.key, { pos, index: rowIndex })
    const buttonGroup = rowHandleRef.current?.querySelector<HTMLElement>('.button-group')
    if (buttonGroup && rowIndex > 0)
      buttonGroup.dataset.show = buttonGroup.dataset.show === 'true' ? 'false' : 'true'
  }, [])

  const deleteSelected = useCallback((e: PointerEvent) => {
    if (!ctx)
      return
    e.preventDefault()
    e.stopPropagation()
    const commands = ctx.get(commandsCtx)
    commands.call(deleteSelectedCellsCommand.key)
  }, [])

  const onAlign = useCallback((direction: 'left' | 'center' | 'right') =>
    (e: PointerEvent) => {
      if (!ctx)
        return
      e.preventDefault()
      e.stopPropagation()
      const commands = ctx.get(commandsCtx)
      commands.call(setAlignCommand.key, direction)
    }, [])

  return html`
    <host
      ondragover=${(e: DragEvent) => e.preventDefault()}
      ondragleave=${(e: DragEvent) => e.preventDefault()}
      onpointermove=${pointerMove}
      onpointerleave=${pointerLeave}
    >
      <button
        data-show="false"
        contenteditable="false"
        draggable="true"
        data-role="col-drag-handle"
        class="handle cell-handle"
        ondragstart=${dragCol}
        onclick=${selectCol}
        ref=${colHandleRef}
      >
        <div
          data-show="false"
          class="button-group"
        >
          <button onpointerdown=${onAlign('left')}>Left</button>
          <button onpointerdown=${onAlign('center')}>Center</button>
          <button onpointerdown=${onAlign('right')}>Right</button>
          <button onpointerdown=${deleteSelected}>Delete</button>
        </div>
      </button>
      <button
        data-show="false"
        contenteditable="false"
        draggable="true"
        data-role="row-drag-handle"
        class="handle cell-handle"
        ondragstart=${dragRow}
        onclick=${selectRow}
        ref=${rowHandleRef}
      >
        <div
          data-show="false"
          class="button-group"
        >
          <button onpointerdown=${deleteSelected}>Delete</button>
        </div>
      </button>
      <div class="table-wrapper" ref=${tableWrapperRef}>
        <div
          data-show="false"
          class="drag-preview"
          data-direction="vertical"
          ref=${dragPreviewRef}
        >
          <table>
            <tbody>
            </tbody>
          </table>
        </div>
        <div
          data-show="false"
          contenteditable="false"
          data-display-type="tool"
          data-role="x-line-drag-handle"
          class="handle line-handle"
          ref=${xLineHandleRef}
        >
          <button onclick=${onAddRow} class="add-button">+</button>
        </div>
        <div
          data-show="false"
          contenteditable="false"
          data-display-type="tool"
          data-role="y-line-drag-handle"
          class="handle line-handle"
          ref=${yLineHandleRef}
        >
          <button onclick=${onAddCol} class="add-button">+</button>
        </div>
        <table class="children" ref=${contentWrapperRef}></table>
      </div>
    </host>
  `
}

tableComponent.props = {
  getPos: Function,
  view: Object,
  ctx: Object,
  node: Object,
}

export const TableElement = c(tableComponent)

function findIndex(parent: Node, child: Node) {
  for (let i = 0; i < parent.childCount; i++) {
    if (parent.child(i) === child)
      return i
  }
  return -1
}

function findPointerIndex(event: PointerEvent, view?: EditorView): CellIndex | undefined {
  if (!view)
    return
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

  const columnIndex = findIndex(row, cell)
  const rowIndex = findIndex(table, row)

  return [rowIndex, columnIndex]
}
