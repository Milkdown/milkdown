import type { Ctx } from '@milkdown/ctx'
import { configureLinkPreviewTooltip } from './preview/preview-configure'
import { configureLinkEditTooltip } from './edit/edit-configure'

export function configureLinkTooltip(ctx: Ctx) {
  configureLinkPreviewTooltip(ctx)
  configureLinkEditTooltip(ctx)
}
