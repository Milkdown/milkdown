import type { Ref } from 'vue'

export type CellIndex = [row: number, col: number]

export interface DragInfo {
  startCoords: [x: number, y: number]
  startIndex: number
  endIndex: number
  type: 'row' | 'col'
}

export interface DragContext {
  preview: HTMLDivElement
  previewRoot: HTMLTableSectionElement
  wrapper: HTMLDivElement
  content: HTMLElement
  contentRoot: HTMLTableSectionElement
  yHandle: HTMLDivElement
  xHandle: HTMLDivElement
  colHandle: HTMLDivElement
  rowHandle: HTMLDivElement
}

export interface Refs {
  dragPreviewRef: Ref<HTMLDivElement | undefined>
  tableWrapperRef: Ref<HTMLDivElement | undefined>
  contentWrapperRef: Ref<HTMLElement | undefined>
  yLineHandleRef: Ref<HTMLDivElement | undefined>
  xLineHandleRef: Ref<HTMLDivElement | undefined>
  colHandleRef: Ref<HTMLDivElement | undefined>
  rowHandleRef: Ref<HTMLDivElement | undefined>
  hoverIndex: Ref<CellIndex>
  lineHoverIndex: Ref<CellIndex>
  dragInfo: Ref<DragInfo | undefined>
}
