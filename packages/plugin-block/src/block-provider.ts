/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'
import type { BlockService } from './block-service'
import { blockService } from './block-plugin'
import type { ActiveNode } from './__internal__/select-node-by-dom'

/// Options for creating block provider.
export type BlockProviderOptions = {
  /// The context of the editor.
  ctx: Ctx
  /// The content of the block.
  content: HTMLElement
  /// The options of tippy.
  tippyOptions?: Partial<Props>
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

/// A provider for creating block.
export class BlockProvider {
  /// @internal
  #tippy: Instance | undefined

  /// @internal
  #element: HTMLElement

  /// @internal
  #tippyOptions: Partial<Props>

  /// @internal
  #ctx: Ctx

  /// @internal
  #service?: BlockService

  constructor(options: BlockProviderOptions) {
    this.#ctx = options.ctx
    this.#element = options.content
    this.#tippyOptions = options.tippyOptions ?? {}
  }

  /// @internal
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

  /// Update provider state by editor view.
  update = (view: EditorView): void => {
    requestAnimationFrame(() => {
      if (!this.#tippy) {
        try {
          this.#init(view)
        }
        catch {
        // ignore
        }
      }
    })
  }

  /// Destroy the block.
  destroy = () => {
    this.#service?.unBind()
    this.#service?.removeEvent(this.#element)
    this.#tippy?.destroy()
    this.#tippy = undefined
  }

  /// Show the block.
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

  /// Hide the block.
  hide = () => {
    this.#tippy?.hide()
  }
}
