import type { Ctx } from '@milkdown/kit/ctx'

import {
  listItemBlockComponent,
  listItemBlockConfig,
} from '@milkdown/kit/component/list-item-block'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import {
  bulletIcon,
  checkBoxCheckedIcon,
  checkBoxUncheckedIcon,
} from '../../icons'
import { CrepeFeature } from '../index'

export interface ListItemConfig {
  bulletIcon: string
  checkBoxCheckedIcon: string
  checkBoxUncheckedIcon: string
}

export type ListItemFeatureConfig = Partial<ListItemConfig>

function configureListItem(ctx: Ctx, config?: ListItemFeatureConfig) {
  ctx.set(listItemBlockConfig.key, {
    renderLabel: ({ label, listType, checked }) => {
      if (checked == null) {
        if (listType === 'bullet') return config?.bulletIcon ?? bulletIcon

        return label
      }

      if (checked) return config?.checkBoxCheckedIcon ?? checkBoxCheckedIcon

      return config?.checkBoxUncheckedIcon ?? checkBoxUncheckedIcon
    },
  })
}

export const listItem: DefineFeature<ListItemFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.ListItem))
    .config((ctx) => configureListItem(ctx, config))
    .use(listItemBlockComponent)
}
