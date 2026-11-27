import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
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
  /// Where the pointer rests over the editor or the handle, to look for the
  /// block under it again when the blocks move. Null while the pointer is
  /// elsewhere, and once the handle is dismissed, until the pointer moves
  /// again.
  #pointerY: null | number = null

  /// @internal
  /// The document of the last lookup, which the active node belongs to.
  #doc: null | Node = null

  /// @internal
  #frame = 0

  /// @internal
  /// The editor DOM that the pointer listeners are on.
  #dom?: HTMLElement

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
    this.unBind()
    this.#ctx = ctx
    this.#notify = notify
    const dom = this.#view?.dom
    if (!dom) return
    this.#dom = dom
    dom.addEventListener('pointermove', this.#trackPointer)
    dom.addEventListener('pointerleave', this.#forgetPointer)
  }

  /// Add mouse event to the dom.
  addEvent = (dom: HTMLElement) => {
    dom.addEventListener('mousedown', this.#handleMouseDown)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
    dom.addEventListener('dragend', this.#handleDragEnd)
    dom.addEventListener('pointermove', this.#trackPointer)
    dom.addEventListener('pointerleave', this.#forgetPointer)
  }

  /// Remove mouse event to the dom.
  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
    dom.removeEventListener('dragend', this.#handleDragEnd)
    dom.removeEventListener('pointermove', this.#trackPointer)
    dom.removeEventListener('pointerleave', this.#forgetPointer)
  }

  /// Unbind the notify function.
  unBind = () => {
    this.#notify = undefined
    this.#dom?.removeEventListener('pointermove', this.#trackPointer)
    this.#dom?.removeEventListener('pointerleave', this.#forgetPointer)
    this.#dom = undefined
    this.#mousemoveCallback.cancel()
    cancelAnimationFrame(this.#frame)
    this.#frame = 0
    this.#active = null
    this.#doc = null
    this.#pointerY = null
  }

  /// Look for the block under the pointer again on the next frame if the
  /// document changed. The block provider calls this on every view update.
  refresh = () => {
    if (this.#view?.state.doc !== this.#doc) this.#schedule()
  }

  /// Look for the block under the pointer again on the next frame, for when
  /// the blocks may have moved under it: on scroll or a layout change.
  relocate = () => {
    this.#schedule()
  }

  /// Make sure that the active node is from the current document: look for
  /// the block under the pointer again right away if the document changed
  /// since. A position from an older document points at the wrong node.
  syncActive = () => {
    this.#syncActive(this.#pointerY)
  }

  /// Keep a hidden handle hidden when the blocks move, until the pointer
  /// moves again. The block provider calls this when it hides the handle.
  dismiss = () => {
    this.#pointerY = null
    this.#mousemoveCallback.cancel()
  }

  /// @internal
  #syncActive = (y: null | number) => {
    const view = this.#view
    if (!view || !this.#active || view.state.doc === this.#doc) return
    if (y === null) this.#hide()
    else this.#locate(view, y)
  }

  /// @internal
  #trackPointer = (event: PointerEvent) => {
    this.#pointerY = event.clientY
  }

  /// @internal
  #forgetPointer = () => {
    this.#pointerY = null
  }

  /// @internal
  /// Look for the block under the resting pointer on the next frame.
  #schedule = () => {
    if (this.#frame || this.#pointerY === null || this.#dragging) return
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0
      // The pointer may have left, or the handle been dismissed, since.
      const view = this.#view
      const y = this.#pointerY
      if (view && y !== null && !this.#dragging && !view.composing)
        this.#locate(view, y)
    })
  }

  /// @internal
  #handleMouseDown = (event: MouseEvent) => {
    this.#syncActive(event.clientY)
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
    this.dismiss()

    this.#dragging = false
    view.dom.dataset.dragging = 'false'
    return false
  }

  /// @internal
  #locate = (view: EditorView, y: number) => {
    this.#doc = view.state.doc
    const result = this.#find(view, y)
    if (result) this.#show(result)
    else this.#hide()
  }

  /// @internal
  #find = (view: EditorView, y: number): ActiveNode | null => {
    if (!view.editable) return null

    const rect = view.dom.getBoundingClientRect()
    if (y < rect.top || y > rect.bottom) return null
    const x = rect.left + rect.width / 2
    const dom = view.root.elementFromPoint(x, y)
    if (!(dom instanceof Element)) return null

    const filterNodes = this.#filterNodes
    if (!filterNodes) return null

    return selectRootNodeByDom(view, { x, y }, filterNodes)
  }

  /// @internal
  #mousemoveCallback = throttle(
    (view: EditorView, event: MouseEvent) => this.#locate(view, event.clientY),
    200
  )

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
    // Browsers send no pointer events during a drag, so the last position
    // is from before it.
    this.#pointerY = null
  }
}
