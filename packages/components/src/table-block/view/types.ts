import type { Ref } from 'atomico'

export type CellIndex = [row: number, col: number]

export interface DragInfo {
  startCoords: [x: number, y: number]
  startIndex: number
  endIndex: number
  type: 'row' | 'col'
}

export interface DragContext {
  preview: HTMLDivElement
  wrapper: HTMLDivElement
  content: HTMLDivElement
  previewRoot: HTMLTableSectionElement
  yHandle: HTMLDivElement
  xHandle: HTMLDivElement
  colHandle: HTMLDivElement
  rowHandle: HTMLDivElement
}

export interface Refs {
  dragPreviewRef: Ref<HTMLDivElement>
  tableWrapperRef: Ref<HTMLDivElement>
  contentWrapperRef: Ref<HTMLDivElement>
  yLineHandleRef: Ref<HTMLDivElement>
  xLineHandleRef: Ref<HTMLDivElement>
  colHandleRef: Ref<HTMLDivElement>
  rowHandleRef: Ref<HTMLDivElement>
  hoverIndex: Ref<CellIndex>
  dragInfo: Ref<DragInfo>
}
