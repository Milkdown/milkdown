import {
  tableBlock,
  tableBlockConfig,
} from '@milkdown-nota/kit/component/table-block'
import { Ctx } from '@milkdown-nota/kit/ctx'
import type { DefineFeature, Icon } from '../shared'
import {
  alignCenterIcon,
  alignLeftIcon,
  alignRightIcon,
  dragHandleIcon,
  plusIcon,
  removeIcon,
} from '../../icons'

interface TableConfig {
  addRowIcon: Icon
  addColIcon: Icon
  deleteRowIcon: Icon
  deleteColIcon: Icon
  alignLeftIcon: Icon
  alignCenterIcon: Icon
  alignRightIcon: Icon
  colDragHandleIcon: Icon
  rowDragHandleIcon: Icon
}

export type TableFeatureConfig = Partial<TableConfig>

export function crepeTableBlockConfig(config: TableFeatureConfig | undefined) {
  return (ctx: Ctx) => {
    ctx.update(tableBlockConfig.key, (defaultConfig) => ({
      ...defaultConfig,
      renderButton: (renderType) => {
        switch (renderType) {
          case 'add_row':
            return config?.addRowIcon?.() ?? plusIcon
          case 'add_col':
            return config?.addColIcon?.() ?? plusIcon
          case 'delete_row':
            return config?.deleteRowIcon?.() ?? removeIcon
          case 'delete_col':
            return config?.deleteColIcon?.() ?? removeIcon
          case 'align_col_left':
            return config?.alignLeftIcon?.() ?? alignLeftIcon
          case 'align_col_center':
            return config?.alignCenterIcon?.() ?? alignCenterIcon
          case 'align_col_right':
            return config?.alignRightIcon?.() ?? alignRightIcon
          case 'col_drag_handle':
            return config?.colDragHandleIcon?.() ?? dragHandleIcon
          case 'row_drag_handle':
            return config?.rowDragHandleIcon?.() ?? dragHandleIcon
        }
      },
    }))
  }
}

export const defineFeature: DefineFeature<TableFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeTableBlockConfig(config))
    .use(tableBlock)
}
