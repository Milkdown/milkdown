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
        return '+'
      case 'add_col':
        return '+'
      case 'delete_row':
        return '-'
      case 'delete_col':
        return '-'
      case 'align_col_left':
        return 'left'
      case 'align_col_center':
        return 'center'
      case 'align_col_right':
        return 'right'
      case 'col_drag_handle':
        return '='
      case 'row_drag_handle':
        return '='
    }
  },
}

export const tableBlockConfig = $ctx({ ...defaultTableBlockConfig }, 'tableBlockConfigCtx')

withMeta(tableBlockConfig, {
  displayName: 'Config<table-block>',
  group: 'TableBlock',
})
