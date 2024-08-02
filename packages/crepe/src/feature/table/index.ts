import { tableBlock, tableBlockConfig } from '@milkdown/kit/component/table-block'
import type { DefineFeature } from '../shared'
import { alignCenterIcon, alignLeftIcon, alignRightIcon, dragHandleIcon, plusIcon, removeIcon } from '../../icons'
// import {
//   alignCenter,
//   alignLeft,
//   alignRight,
//   cellDragHandle,
//   deleteButton,
//   lineAddButton,
// } from './consts'

export const defineFeature: DefineFeature = (editor) => {
  editor.config((ctx) => {
    ctx.update(tableBlockConfig.key, defaultConfig => ({
      ...defaultConfig,
      renderButton: (renderType) => {
        switch (renderType) {
          case 'add_row':
            return plusIcon
          case 'add_col':
            return plusIcon
          case 'delete_row':
            return removeIcon
          case 'delete_col':
            return removeIcon
          case 'align_col_left':
            return alignLeftIcon
          case 'align_col_center':
            return alignCenterIcon
          case 'align_col_right':
            return alignRightIcon
          case 'col_drag_handle':
            return dragHandleIcon
          case 'row_drag_handle':
            return dragHandleIcon
        }
      },
    }))
  }).use(tableBlock)
}
