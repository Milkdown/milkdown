import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin } from '@milkdown/kit/component/link-tooltip'
import type { DefineFeature } from '../shared'
import { confirmIcon, editIcon, linkIcon, removeIcon } from '../../icons'

export const defineFeature: DefineFeature = (editor) => {
  editor
    .config(configureLinkTooltip)
    .config((ctx) => {
      ctx.update(linkTooltipConfig.key, config => ({
        ...config,
        linkIcon: () => linkIcon,
        editButton: () => editIcon,
        removeButton: () => removeIcon,
        confirmButton: () => confirmIcon,
      }))
    })
    .use(linkTooltipPlugin)
}
