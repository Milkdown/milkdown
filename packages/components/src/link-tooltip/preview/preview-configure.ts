import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'

import { posToDOMRect } from '@milkdown/prose'
import { debounce } from 'lodash-es'

import { linkTooltipState } from '../slices'
import { linkPreviewTooltip } from '../tooltips'
import { findMarkPosition, shouldShowPreviewWhenHover } from '../utils'
import { LinkPreviewTooltip } from './preview-view'

export function configureLinkPreviewTooltip(ctx: Ctx) {
  let linkPreviewTooltipView: LinkPreviewTooltip | null

  const DELAY = 50
  const onMouseMove = debounce((view: EditorView, event: MouseEvent) => {
    if (!linkPreviewTooltipView) return
    if (!view.hasFocus()) return

    const state = ctx.get(linkTooltipState.key)
    if (state.mode === 'edit') return

    const result = shouldShowPreviewWhenHover(ctx, view, event)
    if (result) {
      const position = view.state.doc.resolve(result.pos)
      const markPosition = findMarkPosition(
        result.mark,
        result.node,
        view.state.doc,
        position.before(),
        position.after()
      )
      const from = markPosition.start
      const to = markPosition.end
      linkPreviewTooltipView.show(
        result.mark,
        from,
        to,
        posToDOMRect(view, from, to)
      )
      return
    }

    linkPreviewTooltipView.hide()
  }, DELAY)

  const onMouseLeave = () => {
    setTimeout(() => {
      linkPreviewTooltipView?.hide()
    }, DELAY)
  }

  ctx.set(linkPreviewTooltip.key, {
    props: {
      handleDOMEvents: {
        mousemove: onMouseMove,
        mouseleave: onMouseLeave,
      },
    },
    view: (view) => {
      linkPreviewTooltipView = new LinkPreviewTooltip(ctx, view)
      return linkPreviewTooltipView
    },
  })
}
