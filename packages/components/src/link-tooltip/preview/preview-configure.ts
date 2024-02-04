/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import debounce from 'lodash.debounce'
import type { EditorView } from '@milkdown/prose/view'
import { posToDOMRect } from '@milkdown/prose'
import { linkTooltipState } from '../slices'
import { findMarkPosition, shouldShowPreviewWhenHover } from '../utils'
import { linkPreviewTooltip } from '../tooltips'
import { LinkPreviewTooltip } from './preview-view'
import { LinkPreviewElement } from './preview-component'

customElements.define('milkdown-link-preview', LinkPreviewElement)
export function configureLinkPreviewTooltip(ctx: Ctx) {
  let linkPreviewTooltipView: LinkPreviewTooltip | null

  const DELAY = 200
  const onMouseMove = debounce((view: EditorView, event: MouseEvent) => {
    if (!linkPreviewTooltipView)
      return
    if (!view.hasFocus())
      return

    const state = ctx.get(linkTooltipState.key)
    if (state.mode === 'edit')
      return

    const result = shouldShowPreviewWhenHover(ctx, view, event)
    if (result) {
      const position = view.state.doc.resolve(result.pos)
      const markPosition = findMarkPosition(result.mark, view.state.doc, position.before(), position.after())
      const from = markPosition.start
      const to = markPosition.end
      linkPreviewTooltipView.setRect(posToDOMRect(view, from, to))
      linkPreviewTooltipView.show(result.mark, from, to)
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
