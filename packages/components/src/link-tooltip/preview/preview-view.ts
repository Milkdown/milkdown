import type { PluginView } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { Mark } from '@milkdown/prose/model'
import { TooltipProvider } from '@milkdown/plugin-tooltip'
import type { Ctx, Slice } from '@milkdown/ctx'
import type { LinkToolTipState } from '../slices'
import { linkTooltipAPI, linkTooltipConfig, linkTooltipState } from '../slices'
import { LinkPreviewElement } from './preview-component'

export class LinkPreviewTooltip implements PluginView {
  #content = new LinkPreviewElement()
  #provider: TooltipProvider
  #slice: Slice<LinkToolTipState> = this.ctx.use(linkTooltipState.key)

  #hovering = false

  // get #instance() {
  //   return this.#provider.getInstance()
  // }

  constructor(readonly ctx: Ctx, view: EditorView) {
    this.#provider = new TooltipProvider({
      debounce: 0,
      content: this.#content,
      shouldShow: () => false,
    })
    this.#provider.update(view)
    this.#slice = ctx.use(linkTooltipState.key)
    this.#slice.on(this.#onStateChange)
  }

  // setRect = (rect: DOMRect) => {
  //   // this.#provider.getInstance()?.setProps({
  //   //   getReferenceClientRect: () => rect,
  //   // })
  //   this.#provider.virtualElement = {
  //     getBoundingClientRect: () => rect,
  //   }
  // }

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
    this.#provider.element.removeEventListener('mouseenter', this.#onMouseEnter)
    this.#provider.element.removeEventListener('mouseleave', this.#onMouseLeave)
  }

  show = (mark: Mark, from: number, to: number, rect: DOMRect) => {
    this.#content.config = this.ctx.get(linkTooltipConfig.key)
    this.#content.src = mark.attrs.href
    this.#content.onEdit = () => {
      this.ctx.get(linkTooltipAPI.key).editLink(mark, from, to)
    }
    this.#content.onRemove = () => {
      this.ctx.get(linkTooltipAPI.key).removeLink(from, to)
      this.#hide()
    }

    this.#provider.show({
      getBoundingClientRect: () => rect,
    })
    this.#provider.element.addEventListener('mouseenter', this.#onMouseEnter)
    this.#provider.element.addEventListener('mouseleave', this.#onMouseLeave)
  }

  hide = () => {
    if (this.#hovering)
      return

    this.#hide()
  }

  update = () => {}

  destroy = () => {
    this.#slice.off(this.#onStateChange)
    this.#provider.destroy()
    this.#content.remove()
  }
}
