import type { MilkdownPlugin } from '@milkdown/ctx'

import { toggleLinkCommand } from './command'
import { linkTooltipAPI, linkTooltipConfig, linkTooltipState } from './slices'
import { linkEditTooltip, linkPreviewTooltip } from './tooltips'

export * from './slices'
export * from './configure'
export * from './tooltips'
export * from './command'

export const linkTooltipPlugin: MilkdownPlugin[] = [
  linkTooltipState,
  linkTooltipAPI,
  linkTooltipConfig,
  linkPreviewTooltip,
  linkEditTooltip,
  toggleLinkCommand,
].flat()
