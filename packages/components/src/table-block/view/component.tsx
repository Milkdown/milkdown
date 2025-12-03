import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import {
  defineComponent,
  ref,
  type VNodeRef,
  h,
  onMounted,
  type Ref,
} from 'vue'

import type { TableBlockConfig } from '../config'
import type { CellIndex, DragInfo, Refs } from './types'

import { Icon } from '../../__internal__/components/icon'
import { useDragHandlers } from './drag'
import { useOperation } from './operation'
import { usePointerHandlers } from './pointer'
import { recoveryStateBetweenUpdate } from './utils'

type TableBlockProps = {
  view: EditorView
  ctx: Ctx
  getPos: () => number | undefined
  config: TableBlockConfig
  onMount: (div: Element) => void
  node: Ref<Node>
}

h

export const TableBlock = defineComponent<TableBlockProps>({
  props: {
    view: {
      type: Object,
      required: true,
    },
    ctx: {
      type: Object,
      required: true,
    },
    getPos: {
      type: Function,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    onMount: {
      type: Function,
      required: true,
    },
    node: {
      type: Object,
      required: true,
    },
  },
  setup({ view, node, ctx, getPos, config, onMount }) {
    const contentWrapperRef = ref<HTMLElement>()
    const contentWrapperFunctionRef: VNodeRef = (div) => {
      if (div == null) return
      if (div instanceof HTMLElement) {
        contentWrapperRef.value = div
        onMount(div)
      } else {
        contentWrapperRef.value = undefined
      }
    }
    const colHandleRef = ref<HTMLDivElement>()
    const rowHandleRef = ref<HTMLDivElement>()
    const xLineHandleRef = ref<HTMLDivElement>()
    const yLineHandleRef = ref<HTMLDivElement>()
    const tableWrapperRef = ref<HTMLDivElement>()
    const dragPreviewRef = ref<HTMLDivElement>()
    const hoverIndex = ref<CellIndex>([0, 0])
    const lineHoverIndex = ref<CellIndex>([-1, -1])
    const dragInfo = ref<DragInfo>()

    const refs: Refs = {
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

    onMounted(() => {
      requestAnimationFrame(() => {
        // This is a wordaround to keep the popover open when click the select col/row button
        if (view.editable) recoveryStateBetweenUpdate(refs, view, node.value)
      })
    })

    return () => {
      return (
        <div
          onDragstart={(e) => e.preventDefault()}
          onDragover={(e) => e.preventDefault()}
          onDragleave={(e) => e.preventDefault()}
          onPointermove={pointerMove}
          onPointerleave={pointerLeave}
        >
          <div
            data-show="false"
            contenteditable="false"
            draggable="true"
            data-role="col-drag-handle"
            class="handle cell-handle"
            onDragstart={dragCol}
            onClick={selectCol}
            onPointerdown={(e: PointerEvent) => e.stopPropagation()}
            onPointermove={(e: PointerEvent) => e.stopPropagation()}
            ref={colHandleRef}
          >
            <Icon icon={config.renderButton('col_drag_handle')} />
            <div
              data-show="false"
              class="button-group"
              onPointermove={(e: PointerEvent) => e.stopPropagation()}
            >
              <button type="button" onPointerdown={onAlign('left')}>
                <Icon icon={config.renderButton('align_col_left')} />
              </button>
              <button type="button" onPointerdown={onAlign('center')}>
                <Icon icon={config.renderButton('align_col_center')} />
              </button>
              <button type="button" onPointerdown={onAlign('right')}>
                <Icon icon={config.renderButton('align_col_right')} />
              </button>
              <button type="button" onPointerdown={deleteSelected}>
                <Icon icon={config.renderButton('delete_col')} />
              </button>
            </div>
          </div>
          <div
            data-show="false"
            contenteditable="false"
            draggable="true"
            data-role="row-drag-handle"
            class="handle cell-handle"
            onDragstart={dragRow}
            onClick={selectRow}
            onPointerdown={(e: PointerEvent) => e.stopPropagation()}
            onPointermove={(e: PointerEvent) => e.stopPropagation()}
            ref={rowHandleRef}
          >
            <Icon icon={config.renderButton('row_drag_handle')} />
            <div
              data-show="false"
              class="button-group"
              onPointermove={(e: PointerEvent) => e.stopPropagation()}
            >
              <button type="button" onPointerdown={deleteSelected}>
                <Icon icon={config.renderButton('delete_row')} />
              </button>
            </div>
          </div>
          <div class="table-wrapper" ref={tableWrapperRef}>
            <div
              data-show="false"
              class="drag-preview"
              data-direction="vertical"
              ref={dragPreviewRef}
            >
              <table>
                <tbody></tbody>
              </table>
            </div>
            <div
              data-show="false"
              contenteditable="false"
              data-display-type="tool"
              data-role="x-line-drag-handle"
              class="handle line-handle"
              onPointermove={(e: PointerEvent) => e.stopPropagation()}
              ref={xLineHandleRef}
            >
              <button type="button" onClick={onAddRow} class="add-button">
                <Icon icon={config.renderButton('add_row')} />
              </button>
            </div>
            <div
              data-show="false"
              contenteditable="false"
              data-display-type="tool"
              data-role="y-line-drag-handle"
              class="handle line-handle"
              onPointermove={(e: PointerEvent) => e.stopPropagation()}
              ref={yLineHandleRef}
            >
              <button type="button" onClick={onAddCol} class="add-button">
                <Icon icon={config.renderButton('add_col')} />
              </button>
            </div>
            <table ref={contentWrapperFunctionRef} class="children"></table>
          </div>
        </div>
      )
    }
  },
})
