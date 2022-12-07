/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'
import type { BlockService } from './block-service'
import { blockService } from './block-plugin'
import type { ActiveNode } from './select-node-by-dom'

export type BlockProviderOptions = {
  ctx: Ctx
  content: HTMLElement
  tippyOptions?: Partial<Props>
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

export class BlockProvider {
  #tippy: Instance | undefined

  #element: HTMLElement

  #tippyOptions: Partial<Props>

  #ctx: Ctx

  #service?: BlockService

  constructor(options: BlockProviderOptions) {
    this.#ctx = options.ctx
    this.#element = options.content
    this.#tippyOptions = options.tippyOptions ?? {}
  }

  #init(view: EditorView) {
    const service = this.#ctx.get(blockService.key)
    service.bind(this.#ctx, (message) => {
      if (message.type === 'hide')
        this.hide()

      else
        this.show(message.active)
    })

    this.#service = service
    this.#service.addEvent(this.#element)
    this.#element.draggable = true
    this.#tippy = tippy(view.dom, {
      trigger: 'manual',
      placement: 'left-start',
      interactive: true,
      ...this.#tippyOptions,
      content: this.#element,
    })
  }

  update = (view: EditorView): void => {
    requestAnimationFrame(() => {
      if (!this.#tippy)
        this.#init(view)
    })
  }

  destroy = () => {
    this.#service?.unBind()
    this.#service?.removeEvent(this.#element)
    this.#tippy?.destroy()
    this.#tippy = undefined
  }

  show = (active: ActiveNode) => {
    const view = this.#ctx.get(editorViewCtx)
    requestAnimationFrame(() => {
      this.#tippy?.setProps({
        getReferenceClientRect: () => {
          let dom = view.nodeDOM(active.$pos.pos - 1) as HTMLElement
          if (!dom || !(dom instanceof HTMLElement))
            dom = active.el

          return dom.getBoundingClientRect()
        },
      })
      this.#tippy?.show()
    })
  }

  hide = () => {
    this.#tippy?.hide()
  }
}
