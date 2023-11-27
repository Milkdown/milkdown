/* Copyright 2021, Milkdown by Mirone. */
import { $ctx } from '@milkdown/utils'
import { html } from 'atomico'
import { withMeta } from '../__internal__/meta'

export interface ListItemBlockConfig {
  renderLabel: (label: string, listType: string, checked?: boolean) => void
}

export const defaultListItemBlockConfig: ListItemBlockConfig = {
  renderLabel: (label: string, listType, checked?: boolean) => {
    if (checked == null)
      return html`<span class='label'>${listType === 'bullet' ? '⦿' : label}</span>`

    return html`<input class='label' type="checkbox" checked=${checked} />`
  },
}

export const listItemBlockConfig = $ctx(defaultListItemBlockConfig, 'listItemBlockConfigCtx')

withMeta(listItemBlockConfig, {
  displayName: 'Config<list-item-block>',
  group: 'ListItemBlock',
})
