import { tableBlock, tableBlockConfig } from '@milkdown/components'
import type { DefineFeature } from '../shared'
import {
  alignCenter,
  alignLeft,
  alignRight,
  cellDragHandle,
  deleteButton,
  lineAddButton,
} from './consts'

export const defineFeature: DefineFeature = (editor) => {
  editor.config((ctx) => {
    ctx.update(tableBlockConfig.key, defaultConfig => ({
      ...defaultConfig,
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
    }))
  }).use(tableBlock)
}
