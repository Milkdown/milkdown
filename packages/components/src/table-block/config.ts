import { $ctx } from '@milkdown/utils'
import type { html } from 'atomico'
import { withMeta } from '../__internal__/meta'
import { alignCenter, alignLeft, alignRight, cellDragHandle, deleteButton, lineAddButton } from './svg'

export type RenderType =
  | 'add_row'
  | 'add_col'
  | 'delete_row'
  | 'delete_col'
  | 'align_col_left'
  | 'align_col_center'
  | 'align_col_right'
  | 'col_drag_handle'
  | 'row_drag_handle'

export interface TableBlockConfig {
  renderButton: (renderType: RenderType) => HTMLElement | ReturnType<typeof html> | string
}

const defaultTableBlockConfig: TableBlockConfig = {
  renderButton: (renderType) => {
    switch (renderType) {
      case 'add_row':
        return lineAddButton
      case 'add_col':
        return lineAddButton
      case 'delete_row':
        return deleteButton
      case 'delete_col':
        return deleteButton
      case 'align_col_left':
        return alignLeft
      case 'align_col_center':
        return alignCenter
      case 'align_col_right':
        return alignRight
      case 'col_drag_handle':
        return cellDragHandle
      case 'row_drag_handle':
        return cellDragHandle
    }
  },
}

export const tableBlockConfig = $ctx({ ...defaultTableBlockConfig }, 'tableBlockConfigCtx')

withMeta(tableBlockConfig, {
  displayName: 'Config<table-block>',
  group: 'TableBlock',
})
