import type { Ctx } from '@milkdown/ctx'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'

import type { Placement, VirtualElement } from '@floating-ui/dom'
import { computePosition, flip, offset } from '@floating-ui/dom'

import { editorViewCtx } from '@milkdown/core'
import type { BlockService } from './block-service'
import { blockService } from './block-plugin'
import type { ActiveNode } from './types'

/// The context of the block provider.
export interface DeriveContext {
  ctx: Ctx
  active: ActiveNode
  editorDom: HTMLElement
  blockDom: HTMLElement
}

/// Options for creating block provider.
export interface BlockProviderOptions {
  /// The context of the editor.
  ctx: Ctx
  /// The content of the block.
  content: HTMLElement
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
  /// The offset to get the block. Default is 0.
  getOffset?: (deriveContext: DeriveContext) => number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }
  /// The function to get the position of the block. Default is the position of the active node.
  getPosition?: (deriveContext: DeriveContext) => Omit<DOMRect, 'toJSON'>
  /// The function to get the placement of the block. Default is 'left'.
  getPlacement?: (deriveContext: DeriveContext) => Placement
}

/// A provider for creating block.
export class BlockProvider {
  /// @internal
  readonly #element: HTMLElement

  /// @internal
  readonly #ctx: Ctx

  /// @internal
  #service?: BlockService

  /// @internal
  #activeNode: ActiveNode | null = null

  /// @internal
  #initialized = false

  /// @internal
  readonly #getOffset?: (deriveContext: DeriveContext) => number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }

  /// @internal
  readonly #getPosition?: (deriveContext: DeriveContext) => Omit<DOMRect, 'toJSON'>

  /// @internal
  readonly #getPlacement?: (deriveContext: DeriveContext) => Placement

  /// The context of current active node.
  get active() {
    return this.#activeNode
  }

  constructor(options: BlockProviderOptions) {
    this.#ctx = options.ctx
    this.#element = options.content
    this.#getOffset = options.getOffset
    this.#getPosition = options.getPosition
    this.#getPlacement = options.getPlacement
    this.hide()
  }

  /// @internal
  #init() {
    const view = this.#ctx.get(editorViewCtx)
    view.dom.parentElement?.appendChild(this.#element)

    const service = this.#ctx.get(blockService.key)
    service.bind(this.#ctx, (message) => {
      if (message.type === 'hide') {
        this.hide()
        this.#activeNode = null
      }

      else if (message.type === 'show') {
        this.show(message.active)
        this.#activeNode = message.active
      }
    })

    this.#service = service
    this.#service.addEvent(this.#element)
    this.#element.draggable = true
  }

  /// Update provider state by editor view.
  update = (): void => {
    requestAnimationFrame(() => {
      if (!this.#initialized) {
        try {
          this.#init()
          this.#initialized = true
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
    this.#element.remove()
  }

  /// Show the block.
  show = (active: ActiveNode) => {
    const dom = active.el
    const editorDom = this.#ctx.get(editorViewCtx).dom
    const deriveContext: DeriveContext = {
      ctx: this.#ctx,
      active,
      editorDom,
      blockDom: this.#element,
    }
    const virtualEl: VirtualElement = {
      contextElement: dom,
      getBoundingClientRect: () => {
        if (this.#getPosition)
          return this.#getPosition(deriveContext)

        return dom.getBoundingClientRect()
      },
    }
    const middleware = [flip()]
    if (this.#getOffset) {
      const offsetOption = this.#getOffset(deriveContext)
      const offsetExt = offset(offsetOption)
      middleware.push(offsetExt)
    }

    computePosition(virtualEl, this.#element, {
      placement: this.#getPlacement
        ? this.#getPlacement(deriveContext)
        : 'left',
      middleware,
    }).then(({ x, y }) => {
      Object.assign(this.#element.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
      this.#element.dataset.show = 'true'
    })
  }

  /// Hide the block.
  hide = () => {
    this.#element.dataset.show = 'false'
  }
}
