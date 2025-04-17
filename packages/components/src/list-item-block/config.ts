import { $ctx } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'

interface RenderLabelProps {
  label: string
  listType: string
  readonly?: boolean
  checked?: boolean
}

export interface ListItemBlockConfig {
  renderLabel: (props: RenderLabelProps) => string
}

export const defaultListItemBlockConfig: ListItemBlockConfig = {
  renderLabel: ({ label, listType, checked }: RenderLabelProps) => {
    const content =
      checked == null
        ? listType === 'bullet'
          ? '⦿'
          : label
        : checked
          ? '☑'
          : '□'

    return content
  },
}

export const listItemBlockConfig = $ctx(
  defaultListItemBlockConfig,
  'listItemBlockConfigCtx'
)

withMeta(listItemBlockConfig, {
  displayName: 'Config<list-item-block>',
  group: 'ListItemBlock',
})
