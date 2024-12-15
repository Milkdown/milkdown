import {
  configureLinkTooltip,
  linkTooltipConfig,
  linkTooltipPlugin,
} from '@milkdown-nota/kit/component/link-tooltip'
import type { DefineFeature, Icon } from '../shared'
import { confirmIcon, copyIcon, editIcon, removeIcon } from '../../icons'

interface LinkTooltipConfig {
  linkIcon: Icon
  editButton: Icon
  removeButton: Icon
  confirmButton: Icon
  inputPlaceholder: string
  onCopyLink: (link: string) => void
  shouldOpenOutside: (src: string) => boolean
  getActualSrc: (src: string) => string
}

export type LinkTooltipFeatureConfig = Partial<LinkTooltipConfig>

export const defineFeature: DefineFeature<LinkTooltipFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(configureLinkTooltip)
    .config((ctx) => {
      ctx.update(linkTooltipConfig.key, (prev) => ({
        ...prev,
        linkIcon: config?.linkIcon ?? (() => copyIcon),
        editButton: config?.editButton ?? (() => editIcon),
        removeButton: config?.removeButton ?? (() => removeIcon),
        confirmButton: config?.confirmButton ?? (() => confirmIcon),
        inputPlaceholder: config?.inputPlaceholder ?? 'Paste link...',
        onCopyLink: config?.onCopyLink ?? (() => {}),
        shouldOpenOutside: config?.shouldOpenOutside ?? (() => true),
        getActualSrc: config?.getActualSrc ?? ((src: string) => src),
      }))
    })
    .use(linkTooltipPlugin)
}
