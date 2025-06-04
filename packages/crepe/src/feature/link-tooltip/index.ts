import {
  configureLinkTooltip,
  linkTooltipConfig,
  linkTooltipPlugin,
} from '@milkdown/kit/component/link-tooltip'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { copyIcon, editIcon, removeIcon, confirmIcon } from '../../icons'
import { CrepeFeature } from '../index'

interface LinkTooltipConfig {
  linkIcon: string
  editButton: string
  removeButton: string
  confirmButton: string
  inputPlaceholder: string
  onCopyLink: (link: string) => void
}

export type LinkTooltipFeatureConfig = Partial<LinkTooltipConfig>

export const linkTooltip: DefineFeature<LinkTooltipFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.LinkTooltip))
    .config(configureLinkTooltip)
    .config((ctx) => {
      ctx.update(linkTooltipConfig.key, (prev) => ({
        ...prev,
        linkIcon: config?.linkIcon ?? copyIcon,
        editButton: config?.editButton ?? editIcon,
        removeButton: config?.removeButton ?? removeIcon,
        confirmButton: config?.confirmButton ?? confirmIcon,
        inputPlaceholder: config?.inputPlaceholder ?? 'Paste link...',
        onCopyLink: config?.onCopyLink ?? (() => {}),
      }))
    })
    .use(linkTooltipPlugin)
}
