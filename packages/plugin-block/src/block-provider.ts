import type { Ctx } from '@milkdown/ctx'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'
import type { BlockService } from './block-service'
import { blockService } from './block-plugin'
import type { ActiveNode } from './types'

/// Options for creating block provider.
export interface BlockProviderOptions {
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

  /// @internal
  #activeNode: ActiveNode | null = null

  get activeNode() {
    return this.#activeNode
  }

  constructor(options: BlockProviderOptions) {
    this.#ctx = options.ctx
    this.#element = options.content
    this.#tippyOptions = options.tippyOptions ?? {}
  }

  /// @internal
  #init(view: EditorView) {
    const service = this.#ctx.get(blockService.key)
    service.bind(this.#ctx, (message) => {
      if (message.type === 'hide') {
        this.hide()
        this.#activeNode = null
      }

      else {
        this.show(message.active)
        this.#activeNode = message.active
      }
    })

    this.#service = service
    this.#service.addEvent(this.#element)
    this.#element.draggable = true
    this.#tippy = tippy(view.dom, {
      trigger: 'manual',
      placement: 'left-start',
      interactive: true,
      delay: 0,
      arrow: false,
      duration: 0,
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
    requestAnimationFrame(() => {
      this.#tippy?.setProps({
        getReferenceClientRect: () => {
          const dom = active.el

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
