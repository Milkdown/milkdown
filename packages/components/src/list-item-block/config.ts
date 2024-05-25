import { $ctx } from '@milkdown/utils'
import { html } from 'atomico'
import { withMeta } from '../__internal__/meta'

interface RenderLabelProps {
  label: string
  listType: string
  readonly?: boolean
  checked?: boolean
}

export interface ListItemBlockConfig {
  renderLabel: (props: RenderLabelProps) => void
}

export const defaultListItemBlockConfig: ListItemBlockConfig = {
  renderLabel: ({ label, listType, checked, readonly }: RenderLabelProps) => {
    if (checked == null)
      return html`<span class='label'>${listType === 'bullet' ? '⦿' : label}</span>`

    return html`<input disabled=${readonly} class='label' type="checkbox" checked=${checked} />`
  },
}

export const listItemBlockConfig = $ctx(defaultListItemBlockConfig, 'listItemBlockConfigCtx')

withMeta(listItemBlockConfig, {
  displayName: 'Config<list-item-block>',
  group: 'ListItemBlock',
})
