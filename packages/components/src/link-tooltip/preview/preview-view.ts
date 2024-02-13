/* Copyright 2021, Milkdown by Mirone. */
import type { PluginView } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { Mark } from '@milkdown/prose/model'
import { TooltipProvider } from '@milkdown/plugin-tooltip'
import type { Ctx } from '@milkdown/ctx'
import type { LinkToolTipState } from '../slices'
import { linkTooltipAPI, linkTooltipConfig, linkTooltipState } from '../slices'
import { LinkPreviewElement } from './preview-component'

export class LinkPreviewTooltip implements PluginView {
  #content = new LinkPreviewElement()
  #provider = new TooltipProvider({
    debounce: 0,
    content: this.#content,
    shouldShow: () => false,
  })

  #hovering = false

  get #instance() {
    return this.#provider.getInstance()
  }

  constructor(readonly ctx: Ctx, view: EditorView) {
    this.#provider.update(view)
    ctx.use(linkTooltipState.key).on(this.#onStateChange)
  }

  setRect = (rect: DOMRect) => {
    this.#provider.getInstance()?.setProps({
      getReferenceClientRect: () => rect,
    })
  }

  #onStateChange = ({ mode }: LinkToolTipState) => {
    if (mode === 'edit')
      this.#hide()
  }

  #onMouseEnter = () => {
    this.#hovering = true
  }

  #onMouseLeave = () => {
    this.#hovering = false
  }

  #hide = () => {
    this.#provider.hide()
    this.#instance?.popper.addEventListener('mouseenter', this.#onMouseEnter)
    this.#instance?.popper.addEventListener('mouseleave', this.#onMouseLeave)
  }

  show = (mark: Mark, from: number, to: number) => {
    const config = this.ctx.get(linkTooltipConfig.key)
    this.#content.config = config
    this.#content.src = mark.attrs.href
    this.#content.onEdit = () => {
      this.ctx.get(linkTooltipAPI.key).editLink(mark, from, to)
    }
    this.#content.onRemove = () => {
      this.ctx.get(linkTooltipAPI.key).removeLink(from, to)
      this.#hide()
    }

    this.#provider.show()
    this.#instance?.popper.addEventListener('mouseenter', this.#onMouseEnter)
    this.#instance?.popper.addEventListener('mouseleave', this.#onMouseLeave)
  }

  hide = () => {
    if (this.#hovering)
      return

    this.#hide()
  }

  update = () => {}

  destroy = () => {
    this.ctx.use(linkTooltipState.key).off(this.#onStateChange)
    this.#provider.destroy()
    this.#content.remove()
  }
}
