import type { Ctx } from 'milkdown/ctx'
import { listItemBlockComponent, listItemBlockConfig } from 'milkdown/component/list-item-block'
import { html } from 'atomico'
import clsx from 'clsx'
import type { DefineFeature } from '../shared'
import { bulletIcon, checkBoxCheckedIcon, checkBoxEmptyIcon } from './consts'

function configureListItem(ctx: Ctx) {
  ctx.set(listItemBlockConfig.key, {
    renderLabel: ({ label, listType, checked, readonly }) => {
      if (checked == null) {
        if (listType === 'bullet')
          return html`<span class='label'>${bulletIcon}</span>`

        return html`<span class='label'>${label}</span>`
      }

      if (checked)
        return html`<span class=${clsx('label checkbox', readonly && 'readonly')}>${checkBoxCheckedIcon}</span>`

      return html`<span class=${clsx('label checkbox', readonly && 'readonly')}>${checkBoxEmptyIcon}</span>`
    },
  })
}

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(configureListItem)
    .use(listItemBlockComponent)
}
