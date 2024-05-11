import type { Ctx } from '@milkdown/ctx'
import { linkTooltipAPI } from '../slices'
import { linkEditTooltip } from '../tooltips'
import { defIfNotExists } from '../../__internal__/helper'
import { LinkEditElement } from './edit-component'
import { LinkEditTooltip } from './edit-view'

defIfNotExists('milkdown-link-edit', LinkEditElement)
export function configureLinkEditTooltip(ctx: Ctx) {
  let linkEditTooltipView: LinkEditTooltip | null

  ctx.update(linkTooltipAPI.key, api => ({
    ...api,
    addLink: (from, to) => {
      linkEditTooltipView?.addLink(from, to)
    },
    editLink: (mark, from, to) => {
      linkEditTooltipView?.editLink(mark, from, to)
    },
    removeLink: (from, to) => {
      linkEditTooltipView?.removeLink(from, to)
    },
  }))

  ctx.set(linkEditTooltip.key, {
    view: (view) => {
      linkEditTooltipView = new LinkEditTooltip(ctx, view)
      return linkEditTooltipView
    },
  })
}
