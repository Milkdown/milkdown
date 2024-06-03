import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin } from '@milkdown/components/link-tooltip'
import type { DefineFeature } from '../shared'
import { confirmIcon, deleteIcon, editIcon, linkIcon } from './consts'

export const defineFeature: DefineFeature = (editor) => {
  editor
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
