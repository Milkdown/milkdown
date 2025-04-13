import {
  configureLinkTooltip,
  linkTooltipConfig,
  linkTooltipPlugin,
} from '@milkdown/kit/component/link-tooltip'
import type { DefineFeature, Icon } from '../shared'
import {
  legacyConfirmIcon,
  copyIcon,
  removeIcon,
  legacyEditIcon,
} from '../../icons'

interface LinkTooltipConfig {
  linkIcon: Icon
  editButton: Icon
  removeButton: Icon
  confirmButton: Icon
  inputPlaceholder: string
  onCopyLink: (link: string) => void
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
        editButton: config?.editButton ?? (() => legacyEditIcon),
        removeButton: config?.removeButton ?? (() => removeIcon),
        confirmButton: config?.confirmButton ?? (() => legacyConfirmIcon),
        inputPlaceholder: config?.inputPlaceholder ?? 'Paste link...',
        onCopyLink: config?.onCopyLink ?? (() => {}),
      }))
    })
    .use(linkTooltipPlugin)
}
