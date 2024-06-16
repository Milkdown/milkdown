import type { Ctx } from '@milkdown/ctx'
import type { EditorState } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'

import type { VirtualElement } from '@floating-ui/dom'
import { computePosition, flip, platform } from '@floating-ui/dom'

import { offsetParent } from 'composed-offset-position'
import { editorViewCtx } from '@milkdown/core'
import type { BlockService } from './block-service'
import { blockService } from './block-plugin'
import type { ActiveNode } from './types'

/// Options for creating block provider.
export interface BlockProviderOptions {
  /// The context of the editor.
  ctx: Ctx
  /// The content of the block.
  content: HTMLElement
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

/// A provider for creating block.
export class BlockProvider {
  /// @internal
  #element: HTMLElement

  /// @internal
  #ctx: Ctx

  /// @internal
  #service?: BlockService

  /// @internal
  #activeNode: ActiveNode | null = null

  /// @internal
  #initialized = false

  get activeNode() {
    return this.#activeNode
  }

  constructor(options: BlockProviderOptions) {
    this.#ctx = options.ctx
    this.#element = options.content
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

      else {
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
  }

  /// Show the block.
  show = (active: ActiveNode) => {
    const dom = active.el
    const { height } = dom.getBoundingClientRect()
    const { height: handleHeight } = this.#element.getBoundingClientRect()
    const style = window.getComputedStyle(dom)
    const paddingTop = Number.parseInt(style.paddingTop, 10) || 0
    const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0
    const paddingLeft = Number.parseInt(style.paddingLeft, 10) || 0
    const paddingRight = Number.parseInt(style.paddingRight, 10) || 0
    const rect = dom.getBoundingClientRect()
    const virtualEl: VirtualElement = {
      contextElement: dom,
      getBoundingClientRect: () => {
        const value = {
          x: rect.x + paddingLeft,
          y: rect.y + paddingTop,
          top: rect.top + paddingTop,
          bottom: rect.bottom - paddingBottom,
          left: rect.left + paddingLeft,
          right: rect.right - paddingRight,
          width: rect.width - paddingLeft - paddingRight,
          height: rect.height - paddingTop - paddingBottom,
        }
        return {
          ...value,
          toJSON: () => value,
        }
      },
    }
    computePosition(virtualEl, this.#element, {
      placement: handleHeight * 1.8 < (height - paddingTop - paddingBottom) ? 'left-start' : 'left',
      middleware: [flip()],
      platform: {
        ...platform,
        getOffsetParent: element =>
          platform.getOffsetParent(element, offsetParent),
      },
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
