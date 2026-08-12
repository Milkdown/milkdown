import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'

import { editorViewCtx } from '@milkdown/core'
import { browser } from '@milkdown/prose'
import { NodeSelection } from '@milkdown/prose/state'
import { throttle, type DebouncedFunc } from 'lodash-es'

import type { FilterNodes } from './block-config'
import type { ActiveNode } from './types'

import { selectRootNodeByDom } from './__internal__/select-node-by-dom'
import { blockConfig } from './block-config'

const brokenClipboardAPI =
  (browser.ie && <number>browser.ie_version < 15) ||
  (browser.ios && browser.webkit_version < 604)

const buffer = 20

/// @internal
export type BlockServiceMessageType =
  | {
      type: 'hide'
    }
  | {
      type: 'show'
      active: ActiveNode
    }

/// @internal
export type BlockServiceMessage = (message: BlockServiceMessageType) => void

/// @internal
/// prosemirror-view keeps an optional `node` on `view.dragging`: the
/// `NodeSelection` of the node being dragged. Both prosemirror-view and
/// prosemirror-drop-indicator use it in `handleDrop` to remove exactly that
/// node, and fall back to `tr.deleteSelection()` when it is absent. The field
/// is missing from the published types, so we widen it here.
type Dragging = NonNullable<EditorView['dragging']> & {
  node?: NodeSelection
}

/// @internal
/// The block service, provide events and methods for block plugin.
/// Generally you don't need to use this class directly.
export class BlockService {
  /// @internal
  #ctx?: Ctx

  /// @internal
  #createSelection: () => null | NodeSelection = () => {
    if (!this.#active) return null
    const result = this.#active
    const view = this.#view

    this.#activeSelection = null

    if (view && NodeSelection.isSelectable(result.node)) {
      const nodeSelection = NodeSelection.create(
        view.state.doc,
        result.$pos.pos
      )
      view.dispatch(view.state.tr.setSelection(nodeSelection))
      view.focus()
      this.#activeSelection = nodeSelection
      return nodeSelection
    }
    return null
  }

  /// @internal
  #activeSelection: null | NodeSelection = null
  /// @internal
  #active: null | ActiveNode = null
  /// @internal
  #activeDOMRect: undefined | DOMRect = undefined

  /// @internal
  #dragging = false

  /// @internal
  #lastMouseY = -1
  /// @internal
  #rafId: number | null = null

  /// @internal
  get #filterNodes(): FilterNodes | undefined {
    try {
      return this.#ctx?.get(blockConfig.key).filterNodes
    } catch {
      return undefined
    }
  }

  /// @internal
  get #view() {
    return this.#ctx?.get(editorViewCtx)
  }

  /// @internal
  #notify?: BlockServiceMessage

  /// @internal
  #hide = () => {
    this.#notify?.({ type: 'hide' })
    this.#active = null
  }

  /// @internal
  #show = (active: ActiveNode) => {
    this.#active = active
    this.#notify?.({ type: 'show', active })
  }

  /// Bind editor context and notify function to the service.
  bind = (ctx: Ctx, notify: BlockServiceMessage) => {
    this.#ctx = ctx
    this.#notify = notify
    const delay = ctx.get(blockConfig.key).mousemoveThrottle
    this.#mousemoveCallback = throttle(this.#mousemoveHandler, delay)
  }

  /// Add mouse event to the dom.
  addEvent = (dom: HTMLElement) => {
    dom.addEventListener('mousedown', this.#handleMouseDown)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
    dom.addEventListener('dragend', this.#handleDragEnd)
  }

  /// Remove mouse event to the dom.
  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
    dom.removeEventListener('dragend', this.#handleDragEnd)
  }

  /// Unbind the notify function.
  unBind = () => {
    this.#cancelPendingHoverRaf()
    this.#notify = undefined
  }

  /// @internal
  #handleMouseDown = () => {
    this.#ensureActiveForPointer()
    this.#activeDOMRect = this.#active?.el.getBoundingClientRect()
    this.#createSelection()
  }

  /// @internal
  #handleMouseUp = () => {
    if (!this.#dragging) {
      requestAnimationFrame(() => {
        if (!this.#activeDOMRect) return
        this.#view?.focus()
      })

      return
    }
    this.#dragging = false
    this.#activeSelection = null
  }

  /// @internal
  #handleDragStart = (event: DragEvent) => {
    this.#dragging = true

    const view = this.#view
    if (!view) return
    view.dom.dataset.dragging = 'true'

    const selection = this.#activeSelection
    if (event.dataTransfer && selection) {
      const slice = selection.content()
      event.dataTransfer.effectAllowed = 'copyMove'
      const { dom, text } = view.serializeForClipboard(slice)
      event.dataTransfer.clearData()
      event.dataTransfer.setData(
        brokenClipboardAPI ? 'Text' : 'text/html',
        dom.innerHTML
      )
      if (!brokenClipboardAPI) event.dataTransfer.setData('text/plain', text)
      const activeEl = this.#active?.el
      if (activeEl) event.dataTransfer.setDragImage(activeEl, 0, 0)

      // Hand prosemirror the node selection we captured on mousedown so the
      // move deletes exactly the node we picked up. Without it prosemirror
      // falls back to `tr.deleteSelection()` on whatever the live selection is
      // at drop time, which may only strip the text and leave an empty block.
      const dragging: Dragging = {
        slice,
        move: true,
        node: selection,
      }
      view.dragging = dragging
    }
  }

  /// @internal
  #handleDragEnd = () => {
    const view = this.#view
    if (!view) return

    this.#dragEnd(view)

    // `dragend` fires on the handle, which lives outside `view.dom`, so
    // prosemirror-view's own dragend cleanup never runs for handle drags and
    // `view.dragging` would survive a cancelled drag. Clear it the way
    // prosemirror-view does, guarding against browsers that fire `dragend`
    // before `drop`.
    const dragging = view.dragging
    window.setTimeout(() => {
      if (view.dragging === dragging) view.dragging = null
    }, 50)
  }

  /// @internal
  keydownCallback = (view: EditorView) => {
    this.#hide()

    this.#dragging = false
    view.dom.dataset.dragging = 'false'
    return false
  }

  /// @internal
  #resolveHover = (view: EditorView, mouseY: number) => {
    const rect = view.dom.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const dom = view.root.elementFromPoint(x, mouseY)
    if (!(dom instanceof Element)) {
      this.#hide()
      return
    }

    const filterNodes = this.#filterNodes
    if (!filterNodes) return

    const result = selectRootNodeByDom(view, { x, y: mouseY }, filterNodes)

    if (!result) {
      this.#hide()
      return
    }
    this.#show(result)
  }

  /// @internal
  #onMousemove = (view: EditorView, event: MouseEvent) => {
    if (!view.editable) return

    const mouseY = event.clientY
    // Skip tiny Y jitter while still inside the active block; leaving its
    // vertical bounds always resolves so adjacent blocks are not missed.
    if (this.#active && Math.abs(mouseY - this.#lastMouseY) < 5) {
      const activeRect = this.#active.el.getBoundingClientRect()
      if (mouseY >= activeRect.top && mouseY <= activeRect.bottom) return
    }
    this.#lastMouseY = mouseY

    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId)
    this.#rafId = requestAnimationFrame(() => {
      this.#rafId = null
      this.#resolveHover(view, mouseY)
    })
  }

  /// @internal
  #mousemoveCallback: DebouncedFunc<(view: EditorView, event: MouseEvent) => void> =
    throttle(() => {}, 50)

  /// @internal
  mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (view.composing || !view.editable) return false

    this.#mousemoveCallback(view, event)

    return false
  }

  /// @internal
  dragoverCallback = (view: EditorView, event: DragEvent) => {
    if (this.#dragging) {
      const root = this.#view?.dom.parentElement
      if (!root) return false

      const hasHorizontalScrollbar = root.scrollHeight > root.clientHeight

      const rootRect = root.getBoundingClientRect()
      if (hasHorizontalScrollbar) {
        if (root.scrollTop > 0 && Math.abs(event.y - rootRect.y) < buffer) {
          const top = root.scrollTop > 10 ? root.scrollTop - 10 : 0
          root.scrollTop = top
          return false
        }
        const totalHeight = Math.round(view.dom.getBoundingClientRect().height)
        const scrollBottom = Math.round(root.scrollTop + rootRect.height)
        if (
          scrollBottom < totalHeight &&
          Math.abs(event.y - (rootRect.height + rootRect.y)) < buffer
        ) {
          const top = root.scrollTop + 10
          root.scrollTop = top
          return false
        }
      }
    }
    return false
  }

  /// @internal
  dragenterCallback = (view: EditorView) => {
    if (!view.dragging) return

    this.#dragging = true
    view.dom.dataset.dragging = 'true'
  }

  /// @internal
  dragleaveCallback = (view: EditorView, event: DragEvent) => {
    const x = event.clientX
    const y = event.clientY
    // if cursor out of the editor
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) {
      this.#active = null
      this.#dragEnd(view)
    }
  }

  /// @internal
  dropCallback = (view: EditorView) => {
    this.#dragEnd(view)

    return false
  }

  /// @internal
  dragendCallback = (view: EditorView) => {
    this.#dragEnd(view)
  }

  /// @internal
  #dragEnd = (view: EditorView) => {
    this.#dragging = false
    view.dom.dataset.dragging = 'false'
  }
}
