import type { Ctx, Slice } from '@milkdown/ctx'
import type { Mark } from '@milkdown/prose/model'
import type { PluginView } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'

import { TooltipProvider } from '@milkdown/plugin-tooltip'
import { createApp, ref, type App, type Ref } from 'vue'

import type { LinkTooltipConfig, LinkToolTipState } from '../slices'

import { linkTooltipAPI, linkTooltipConfig, linkTooltipState } from '../slices'
import { PreviewLink } from './component'

export class LinkPreviewTooltip implements PluginView {
  #content: HTMLElement
  #provider: TooltipProvider
  #slice: Slice<LinkToolTipState> = this.ctx.use(linkTooltipState.key)
  #config: Ref<LinkTooltipConfig>
  #src = ref('')
  #onEdit = ref(() => {})
  #onRemove = ref(() => {})
  #app: App
  #editorView: EditorView

  #hovering = false

  constructor(
    readonly ctx: Ctx,
    view: EditorView
  ) {
    this.#editorView = view
    this.#config = ref(this.ctx.get(linkTooltipConfig.key))
    this.#app = createApp(PreviewLink, {
      config: this.#config,
      src: this.#src,
      onEdit: this.#onEdit,
      onRemove: this.#onRemove,
    })
    this.#content = document.createElement('div')
    this.#content.className = 'milkdown-link-preview'
    this.#app.mount(this.#content)

    this.#provider = new TooltipProvider({
      debounce: 0,
      content: this.#content,
      shouldShow: () => false,
    })
    this.#provider.update(view)
    this.#slice = ctx.use(linkTooltipState.key)
    this.#slice.on(this.#onStateChange)
  }

  #onStateChange = ({ mode }: LinkToolTipState) => {
    if (mode === 'edit') this.#hide()
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
    this.#config.value = this.ctx.get(linkTooltipConfig.key)
    this.#src.value = mark.attrs.href
    this.#onEdit.value = () => {
      this.ctx.get(linkTooltipAPI.key).editLink(mark, from, to)
    }
    this.#onRemove.value = () => {
      this.ctx.get(linkTooltipAPI.key).removeLink(from, to)
      this.#hide()
    }

    this.#provider.show({ getBoundingClientRect: () => rect }, this.#editorView)
    this.#provider.element.addEventListener('mouseenter', this.#onMouseEnter)
    this.#provider.element.addEventListener('mouseleave', this.#onMouseLeave)
  }

  hide = () => {
    if (this.#hovering) return

    this.#hide()
  }

  update = () => {}

  destroy = () => {
    this.#app.unmount()
    this.#slice.off(this.#onStateChange)
    this.#provider.destroy()
    this.#content.remove()
  }
}
