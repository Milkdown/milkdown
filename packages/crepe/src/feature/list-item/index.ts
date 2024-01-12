/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { listItemBlockComponent, listItemBlockConfig } from '@milkdown/components/list-item-block'
import { html } from 'atomico'
import { injectStyle } from '../../core/slice'
import type { DefineFeature } from '../shared'
import { bulletIcon } from './consts'
import style from './style.css?inline'

function configureListItem(ctx: Ctx) {
  ctx.set(listItemBlockConfig.key, {
    renderLabel: (label: string, listType, checked?: boolean) => {
      if (checked == null) {
        if (listType === 'bullet')
          return html`<span class='label'>${bulletIcon}</span>`

        return html`<span class='label'>${label}</span>`
      }

      return html`<input class='label' type="checkbox" checked=${checked} />`
    },
  })
}

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(injectStyle(style))
    .config(configureListItem)
    .use(listItemBlockComponent)
}
