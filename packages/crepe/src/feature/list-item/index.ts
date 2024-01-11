/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import type { Ctx } from '@milkdown/ctx'
import { listItemBlockComponent, listItemBlockConfig } from '@milkdown/components/list-item-block'
import { html } from 'atomico'
import { injectStyle } from '../../core/slice'
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

export function defineFeature(editor: Editor) {
  editor
    .config(injectStyle(style))
    .config(configureListItem)
    .use(listItemBlockComponent)
}
