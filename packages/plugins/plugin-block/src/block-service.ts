import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'
import { browser } from '@milkdown/prose'
import type { Selection } from '@milkdown/prose/state'
import { NodeSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import throttle from 'lodash.throttle'

import type { FilterNodes } from './block-config'
import { blockConfig } from './block-config'
import { selectRootNodeByDom } from './__internal__/select-node-by-dom'
import { serializeForClipboard } from './__internal__/serialize-for-clipboard'
import type { ActiveNode } from './types'

const brokenClipboardAPI
    = (browser.ie && <number>browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604)

const buffer = 20

/// @internal
export type BlockServiceMessageType = {
  type: 'hide'
} | {
  type: 'show'
  active: ActiveNode
}

/// @internal
export type BlockServiceMessage = (message: BlockServiceMessageType) => void

/// @internal
/// The block service, provide events and methods for block plugin.
/// Generally you don't need to use this class directly.
export class BlockService {
  /// @internal
  #ctx?: Ctx

  /// @internal
  #createSelection: () => null | Selection = () => {
    if (!this.#active)
      return null
    const result = this.#active
    const view = this.#view

    if (view && NodeSelection.isSelectable(result.node)) {
      const nodeSelection = NodeSelection.create(view.state.doc, result.$pos.pos)
      view.dispatch(view.state.tr.setSelection(nodeSelection))
      view.focus()
      this.#activeSelection = nodeSelection
      return nodeSelection
    }
    return null
  }

  /// @internal
  #activeSelection: null | Selection = null
  /// @internal
  #active: null | ActiveNode = null
  /// @internal
  #activeDOMRect: undefined | DOMRect = undefined

  /// @internal
  #dragging = false

  /// @internal
  get #filterNodes(): FilterNodes | undefined {
    return this.#ctx?.get(blockConfig.key).filterNodes
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
  }

  /// Add mouse event to the dom.
  addEvent = (dom: HTMLElement) => {
    dom.addEventListener('mousedown', this.#handleMouseDown)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
  }

  /// Remove mouse event to the dom.
  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
  }

  /// Unbind the notify function.
  unBind = () => {
    this.#notify = undefined
  }

  /// @internal
  #handleMouseDown = () => {
    this.#activeDOMRect = this.#active?.el.getBoundingClientRect()
    this.#createSelection()
  }

  /// @internal
  #handleMouseUp = () => {
    if (!this.#dragging) {
      requestAnimationFrame(() => {
        if (!this.#activeDOMRect)
          return
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
    if (!view)
      return
    view.dom.dataset.dragging = 'true'

    const selection = this.#activeSelection
    if (event.dataTransfer && selection) {
      const slice = selection.content()
      event.dataTransfer.effectAllowed = 'copyMove'
      const { dom, text } = serializeForClipboard(view, slice)
      event.dataTransfer.clearData()
      event.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML)
      if (!brokenClipboardAPI)
        event.dataTransfer.setData('text/plain', text)
      const activeEl = this.#active?.el
      if (activeEl)
        event.dataTransfer.setDragImage(activeEl, 0, 0)

      view.dragging = {
        slice,
        move: true,
      }
    }
  }

  /// @internal
  keydownCallback = (view: EditorView) => {
    this.#hide()

    this.#dragging = false
    view.dom.dataset.dragging = 'false'
    return false
  }

  /// @internal
  #mousemoveCallback = throttle((view: EditorView, event: MouseEvent) => {
    if (!view.editable)
      return

    const rect = view.dom.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const dom = view.root.elementFromPoint(x, event.clientY)
    if (!(dom instanceof Element)) {
      this.#hide()
      return
    }

    const filterNodes = this.#filterNodes
    if (!filterNodes)
      return

    const result = selectRootNodeByDom(view, { x, y: event.clientY }, filterNodes)

    if (!result) {
      this.#hide()
      return
    }
    this.#show(result)
  }, 200)

  /// @internal
  mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (view.composing || !view.editable)
      return false

    this.#mousemoveCallback(view, event)

    return false
  }

  /// @internal
  dragoverCallback = (view: EditorView, event: DragEvent) => {
    if (this.#dragging) {
      const root = this.#view?.dom.parentElement
      if (!root)
        return false

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
        if (scrollBottom < totalHeight && Math.abs(event.y - (rootRect.height + rootRect.y)) < buffer) {
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
    if (!view.dragging)
      return

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
