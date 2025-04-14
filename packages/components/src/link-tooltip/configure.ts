import type { Ctx } from '@milkdown/ctx'

import { configureLinkEditTooltip } from './edit/edit-configure'
import { configureLinkPreviewTooltip } from './preview/preview-configure'

export function configureLinkTooltip(ctx: Ctx) {
  configureLinkPreviewTooltip(ctx)
  configureLinkEditTooltip(ctx)
}
