import type { MilkdownPlugin } from '@milkdown/ctx'
import { linkTooltipAPI, linkTooltipConfig, linkTooltipState } from './slices'
import { linkEditTooltip, linkPreviewTooltip } from './tooltips'

export * from './slices'
export * from './configure'
export * from './tooltips'

export const linkTooltipPlugin: MilkdownPlugin[] = [linkTooltipState, linkTooltipAPI, linkTooltipConfig, linkPreviewTooltip, linkEditTooltip].flat()
