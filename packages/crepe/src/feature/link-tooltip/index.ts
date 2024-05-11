import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin } from '@milkdown/components/link-tooltip'
import { injectStyle } from '../../core/slice'
import type { DefineFeature } from '../shared'
import { confirmIcon, deleteIcon, editIcon, linkIcon } from './consts'
import style from './style.css?inline'

export const defineFeature: DefineFeature = (editor) => {
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
