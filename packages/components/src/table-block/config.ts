import { $ctx } from '@milkdown/utils'
import type { html } from 'atomico'
import { withMeta } from '../__internal__/meta'

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
        return `Add Row`
      case 'add_col':
        return `Add Col`
      case 'delete_row':
        return `Delete Row`
      case 'delete_col':
        return `Delete Col`
      case 'align_col_left':
        return `Align Left`
      case 'align_col_center':
        return `Align Center`
      case 'align_col_right':
        return `Align Right`
      case 'col_drag_handle':
        return `Drag Handle`
      case 'row_drag_handle':
        return `Drag Handle`
    }
  },
}

export const tableBlockConfig = $ctx({ ...defaultTableBlockConfig }, 'tableBlockConfigCtx')

withMeta(tableBlockConfig, {
  displayName: 'Config<table-block>',
  group: 'TableBlock',
})
