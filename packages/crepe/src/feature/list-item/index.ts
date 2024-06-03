import type { Ctx } from '@milkdown/ctx'
import { listItemBlockComponent, listItemBlockConfig } from '@milkdown/components/list-item-block'
import { html } from 'atomico'
import type { DefineFeature } from '../shared'
import { bulletIcon } from './consts'

function configureListItem(ctx: Ctx) {
  ctx.set(listItemBlockConfig.key, {
    renderLabel: ({ label, listType, checked, readonly }) => {
      if (checked == null) {
        if (listType === 'bullet')
          return html`<span class='label'>${bulletIcon}</span>`

        return html`<span class='label'>${label}</span>`
      }

      return html`<input disabled=${readonly} class='label' type="checkbox" checked=${checked} />`
    },
  })
}

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(configureListItem)
    .use(listItemBlockComponent)
}
