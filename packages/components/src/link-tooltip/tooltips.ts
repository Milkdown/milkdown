import { tooltipFactory } from '@milkdown/plugin-tooltip'
import { withMeta } from '../__internal__/meta'

export const linkPreviewTooltip = tooltipFactory('LINK_PREVIEW')
withMeta(linkPreviewTooltip[0], {
  displayName: 'PreviewTooltipSpec<link-tooltip>',
  group: 'LinkTooltip',
})
withMeta(linkPreviewTooltip[1], {
  displayName: 'PreviewTooltipPlugin<link-tooltip>',
  group: 'LinkTooltip',
})
export const linkEditTooltip = tooltipFactory('LINK_EDIT')
withMeta(linkEditTooltip[0], {
  displayName: 'EditTooltipSpec<link-tooltip>',
  group: 'LinkTooltip',
})
withMeta(linkEditTooltip[1], {
  displayName: 'EditTooltipPlugin<link-tooltip>',
  group: 'LinkTooltip',
})
