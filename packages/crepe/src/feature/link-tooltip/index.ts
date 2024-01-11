/* Copyright 2021, Milkdown by Mirone. */
import type { Editor } from '@milkdown/core'
import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin } from '@milkdown/components/link-tooltip'
import { injectStyle } from '../../core/slice'
import { confirmIcon, deleteIcon, editIcon, linkIcon } from './consts'
import style from './style.css?inline'

export function defineFeature(editor: Editor) {
  editor
    .config(injectStyle(style))
    .config(configureLinkTooltip)
    .config((ctx) => {
      ctx.update(linkTooltipConfig.key, config => ({
        ...config,
        linkIcon: () => linkIcon,
        editButton: () => editIcon,
        removeButton: () => deleteIcon,
        confirmButton: () => confirmIcon,
      }))
    })
    .use(linkTooltipPlugin)
}
