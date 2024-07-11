import type { Component } from 'atomico'
import { c, html, useHost, useLayoutEffect, useMemo, useRef } from 'atomico'
import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'
import type { Ctx } from '@milkdown/ctx'

import clsx from 'clsx'
import type { TableBlockConfig } from '../config'
import { useDragHandlers } from './drag'
import type { CellIndex, DragInfo, Refs } from './types'
import { recoveryStateBetweenUpdate } from './utils'
import { usePointerHandlers } from './pointer'
import { useOperation } from './operation'

export interface TableComponentProps {
  view: EditorView
  ctx: Ctx
  getPos: () => number | undefined
  node: Node
  config: TableBlockConfig
}

export const tableComponent: Component<TableComponentProps> = ({
  view,
  ctx,
  getPos,
  node,
  config,
}) => {
  const host = useHost()
  const contentWrapperRef = useRef<HTMLDivElement>()
  const colHandleRef = useRef<HTMLDivElement>()
  const rowHandleRef = useRef<HTMLDivElement>()
  const xLineHandleRef = useRef<HTMLDivElement>()
  const yLineHandleRef = useRef<HTMLDivElement>()
  const tableWrapperRef = useRef<HTMLDivElement>()
  const dragPreviewRef = useRef<HTMLDivElement>()
  const hoverIndex = useRef<CellIndex>([0, 0])
  const lineHoverIndex = useRef<CellIndex>([-1, -1])
  const dragInfo = useRef<DragInfo>()
  const refs: Refs = useMemo(() => {
    return {
      dragPreviewRef,
      tableWrapperRef,
      contentWrapperRef,
      yLineHandleRef,
      xLineHandleRef,
      colHandleRef,
      rowHandleRef,
      hoverIndex,
      lineHoverIndex,
      dragInfo,
    }
  }, [])

  useLayoutEffect(() => {
    const current = contentWrapperRef.current
    if (!current)
      return

    const contentDOM = host.current.querySelector('[data-content-dom]')

    if (contentDOM)
      current.appendChild(contentDOM)

    if (view?.editable)
      recoveryStateBetweenUpdate(refs, ctx, node)
  }, [])

  const { pointerLeave, pointerMove } = usePointerHandlers(refs, view)
  const { dragRow, dragCol } = useDragHandlers(refs, ctx, getPos)
  const {
    onAddRow,
    onAddCol,
    selectCol,
    selectRow,
    deleteSelected,
    onAlign,
  } = useOperation(refs, ctx, getPos)

  return html`
    <host
      class=${clsx(!view?.editable && 'readonly')}
      ondragstart=${(e: DragEvent) => e.preventDefault()}
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
        onpointerdown=${(e: PointerEvent) => e.stopPropagation()}
        onpointermove=${(e: PointerEvent) => e.stopPropagation()}
        ref=${colHandleRef}
      >
        ${config?.renderButton('col_drag_handle')}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${(e: PointerEvent) => e.stopPropagation}
        >
          <button onpointerdown=${onAlign('left')}>
            ${config?.renderButton('align_col_left')}
          </button>
          <button onpointerdown=${onAlign('center')}>
            ${config?.renderButton('align_col_center')}
          </button>
          <button onpointerdown=${onAlign('right')}>
            ${config?.renderButton('align_col_right')}
          </button>
          <button onpointerdown=${deleteSelected}>
            ${config?.renderButton('delete_col')}
          </button>
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
        onpointerdown=${(e: PointerEvent) => e.stopPropagation()}
        onpointermove=${(e: PointerEvent) => e.stopPropagation()}
        ref=${rowHandleRef}
      >
        ${config?.renderButton('row_drag_handle')}
        <div
          data-show="false"
          class="button-group"
          onpointermove=${(e: PointerEvent) => e.stopPropagation}
        >
          <button onpointerdown=${deleteSelected}>
            ${config?.renderButton('delete_row')}
          </button>
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
          onpointermove=${(e: PointerEvent) => e.stopPropagation}
          ref=${xLineHandleRef}
        >
          <button onclick=${onAddRow} class="add-button">
            ${config?.renderButton('add_row')}
          </button>
        </div>
        <div
          data-show="false"
          contenteditable="false"
          data-display-type="tool"
          data-role="y-line-drag-handle"
          class="handle line-handle"
          onpointermove=${(e: PointerEvent) => e.stopPropagation}
          ref=${yLineHandleRef}
        >
          <button onclick=${onAddCol} class="add-button">
            ${config?.renderButton('add_col')}
          </button>
        </div>
        <table ref=${contentWrapperRef} class="children"></table>
      </div>
    </host>
  `
}

tableComponent.props = {
  getPos: Function,
  view: Object,
  ctx: Object,
  node: Object,
  config: Object,
}

export const TableElement = c(tableComponent)
