import {
  RenderType,
  tableBlock,
  tableBlockConfig,
} from '@milkdown-nota/kit/component/table-block'
import { Ctx, SliceType } from '@milkdown-nota/kit/ctx'
import type { DefineFeature, Icon } from '../shared'
import {
  alignCenterIcon,
  alignLeftIcon,
  alignRightIcon,
  dragHandleIcon,
  plusIcon,
  removeIcon,
} from '../../icons'
import { html } from 'atomico'

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

export function crepeTableBlockConfig(
  configKey: SliceType<
    {
      renderButton: (
        renderType: RenderType
      ) => HTMLElement | ReturnType<typeof html> | string
    },
    'tableBlockConfigCtx'
  >,
  config: TableFeatureConfig | undefined
) {
  return (ctx: Ctx) => {
    ctx.update(configKey, (defaultConfig) => ({
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
    .config(crepeTableBlockConfig(tableBlockConfig.key, config))
    .use(tableBlock)
}
