import { configureLinkTooltip, linkTooltipConfig, linkTooltipPlugin } from '@milkdown/kit/component/link-tooltip'
import type { DefineFeature, Icon } from '../shared'
import { confirmIcon, editIcon, linkIcon, removeIcon } from '../../icons'

interface LinkTooltipConfig {
  linkIcon: Icon
  editButton: Icon
  removeButton: Icon
  confirmButton: Icon
}

export type LinkTooltipFeatureConfig = Partial<LinkTooltipConfig>

export const defineFeature: DefineFeature<LinkTooltipFeatureConfig> = (editor, config) => {
  editor
    .config(configureLinkTooltip)
    .config((ctx) => {
      ctx.update(linkTooltipConfig.key, prev => ({
        ...prev,
        linkIcon: config?.linkIcon ?? (() => linkIcon),
        editButton: config?.editButton ?? (() => editIcon),
        removeButton: config?.removeButton ?? (() => removeIcon),
        confirmButton: config?.confirmButton ?? (() => confirmIcon),
      }))
    })
    .use(linkTooltipPlugin)
}
