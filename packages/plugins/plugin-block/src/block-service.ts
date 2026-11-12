import type { Ctx } from '@milkdown/ctx'
import type { Node as ProseNode } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import { editorViewCtx } from '@milkdown/core'
import { browser } from '@milkdown/prose'
import { NodeSelection } from '@milkdown/prose/state'
import { throttle } from 'lodash-es'

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
/// is missing from the published types, so this type widens it.
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
  get #filterNodes(): FilterNodes | undefined {
    try {
      return this.#ctx?.get(blockConfig.key).filterNodes
    } catch {
      return undefined
    }
  }

  /// @internal
  get #view(): EditorView | undefined {
    try {
      return this.#ctx?.get(editorViewCtx)
    } catch {
      return undefined
    }
  }

  /// @internal
  /// The last pointer position over the editor or the handle, or null when
  /// the pointer left both.
  #pointer: null | { x: number; y: number } = null

  /// @internal
  #frame = 0

  /// @internal
  /// A lookup is due on the next frame.
  #pending = false

  /// @internal
  /// The document that the active node belongs to.
  #doc: null | ProseNode = null

  /// @internal
  #handleDom?: HTMLElement

  /// @internal
  #viewDom?: HTMLElement

  /// @internal
  #observer?: ResizeObserver

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

    const view = this.#view
    if (!view) return
    this.#viewDom = view.dom
    view.dom.addEventListener('pointerleave', this.#handlePointerLeave)
    // The blocks move without a pointer move when the document, the editor
    // size or a scroll position changes.
    if (typeof ResizeObserver !== 'undefined') {
      this.#observer = new ResizeObserver(this.#relayout)
      this.#observer.observe(view.dom)
    }
    window.addEventListener('scroll', this.#relayout, {
      capture: true,
      passive: true,
    })
    window.addEventListener('resize', this.#relayout)
  }

  /// Add mouse event to the dom.
  addEvent = (dom: HTMLElement) => {
    this.#handleDom = dom
    dom.addEventListener('pointerleave', this.#handlePointerLeave)
    dom.addEventListener('mousedown', this.#handleMouseDown)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
    dom.addEventListener('dragend', this.#handleDragEnd)
  }

  /// Remove mouse event to the dom.
  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('pointerleave', this.#handlePointerLeave)
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
    dom.removeEventListener('dragend', this.#handleDragEnd)
  }

  /// Unbind the notify function.
  unBind = () => {
    this.#notify = undefined
    this.#viewDom?.removeEventListener('pointerleave', this.#handlePointerLeave)
    this.#viewDom = undefined
    this.#mousemoveCallback.cancel()
    this.#observer?.disconnect()
    this.#observer = undefined
    window.removeEventListener('scroll', this.#relayout, { capture: true })
    window.removeEventListener('resize', this.#relayout)
    if (this.#frame) cancelAnimationFrame(this.#frame)
    this.#frame = 0
  }

  /// Find the active node again if the document changed since it was found.
  /// The block provider calls this on every editor view update.
  refresh = () => {
    const view = this.#view
    if (view && this.#active && view.state.doc !== this.#doc) this.#schedule()
  }

  /// @internal
  #handleMouseDown = () => {
    // Do not select by a position from an older document.
    const view = this.#view
    if (view && this.#active && view.state.doc !== this.#doc) this.#locate(view)
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

      // Pass prosemirror the node selection captured on mousedown, so
      // the move deletes that node. Without it prosemirror falls back to
      // `tr.deleteSelection()` on the live selection at drop time, which
      // can strip the text and leave an empty block.
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
  /// The point to look for a block at: the pointer, or the active node itself
  /// when the pointer is not over the editor.
  #target = (view: EditorView): null | { x: number; y: number } => {
    if (this.#pointer) return this.#pointer
    const el = this.#active?.el
    if (!el || !el.isConnected || !view.dom.contains(el)) return null
    const rect = el.getBoundingClientRect()
    return {
      x: rect.left + Math.min(rect.width / 2, 8),
      y: rect.top + Math.min(rect.height / 2, 8),
    }
  }

  /// @internal
  #locate = (view: EditorView) => {
    this.#pending = false
    if (!view.editable || view.composing || this.#dragging) return

    this.#doc = view.state.doc
    const filterNodes = this.#filterNodes
    if (!filterNodes) return

    const point = this.#target(view)
    const rect = view.dom.getBoundingClientRect()
    if (!point || point.y < rect.top || point.y > rect.bottom) {
      this.#hide()
      return
    }

    // Look at the pointer x first, kept inside the content box. A narrow or
    // centered block is not under the middle of the editor. The middle stays
    // as a fallback for a pointer over empty space.
    const style = getComputedStyle(view.dom)
    const inset = (side: 'Left' | 'Right') =>
      (style[`border${side}Style`] === 'none'
        ? 0
        : Number.parseFloat(style[`border${side}Width`]) || 0) +
      (Number.parseFloat(style[`padding${side}`]) || 0)
    const left = rect.left + inset('Left')
    const right = rect.right - inset('Right')
    const xs: number[] = []
    if (right - left > 2 && Number.isFinite(point.x))
      xs.push(Math.min(Math.max(point.x, left + 1), right - 1))
    xs.push(rect.left + rect.width / 2)

    for (const x of xs) {
      const dom = view.root.elementFromPoint(x, point.y)
      if (!(dom instanceof Element)) continue
      const result = selectRootNodeByDom(view, { x, y: point.y }, filterNodes)
      if (result) {
        this.#show(result)
        return
      }
    }
    this.#hide()
  }

  /// @internal
  #runFrame = () => {
    this.#frame = 0
    if (!this.#pending) return
    const view = this.#view
    if (view && !view.isDestroyed) this.#locate(view)
  }

  /// @internal
  /// Look for the block on the next frame. Many events in one frame cause one
  /// lookup.
  #schedule = () => {
    this.#pending = true
    if (!this.#frame) this.#frame = requestAnimationFrame(this.#runFrame)
  }

  /// @internal
  /// A handle that keydown hid stays hidden.
  #relayout = () => {
    if (this.#active) this.#schedule()
  }

  /// @internal
  #handlePointerLeave = (event: PointerEvent) => {
    const to = event.relatedTarget
    if (
      to instanceof Node &&
      (this.#handleDom?.contains(to) || this.#viewDom?.contains(to))
    )
      return
    this.#pointer = null
  }

  /// @internal
  #mousemoveCallback = throttle((view: EditorView) => {
    this.#locate(view)
  }, 200)

  /// @internal
  mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (view.composing || !view.editable) return false

    this.#pointer = { x: event.clientX, y: event.clientY }
    this.#mousemoveCallback(view)

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
