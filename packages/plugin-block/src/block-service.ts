/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'
import { browser } from '@milkdown/prose'
import type { Selection } from '@milkdown/prose/state'
import { NodeSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'

import type { FilterNodes } from './block-plugin'
import { blockConfig } from './block-plugin'
import { removePossibleTable } from './__internal__/remove-possible-table'
import type { ActiveNode } from './__internal__/select-node-by-dom'
import { selectRootNodeByDom } from './__internal__/select-node-by-dom'
import { serializeForClipboard } from './__internal__/serialize-for-clipboard'

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
      const nodeSelection = NodeSelection.create(view.state.doc, result.$pos.pos - (result.node.isLeaf ? 0 : 1))
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
  #hovering = false

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
    this.#hovering = false
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
    dom.addEventListener('mouseenter', this.#handleMouseEnter)
    dom.addEventListener('mouseleave', this.#handleMouseLeave)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
  }

  /// Remove mouse event to the dom.
  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseenter', this.#handleMouseEnter)
    dom.removeEventListener('mouseleave', this.#handleMouseLeave)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
  }

  /// Unbind the notify function.
  unBind = () => {
    this.#notify = undefined
  }

  /// @internal
  #handleMouseEnter = () => {
    this.#hovering = true
  }

  /// @internal
  #handleMouseLeave = () => {
    this.#hovering = false
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
    const selection = this.#activeSelection
    const view = this.#view
    if (!view)
      return

    // Align the behavior with https://github.com/ProseMirror/prosemirror-view/blob/master/src/input.ts#L608
    if (event.dataTransfer && selection) {
      const slice = selection.content()
      event.dataTransfer.effectAllowed = 'copyMove'
      const { dom, text } = serializeForClipboard(view, slice)
      event.dataTransfer.clearData()
      event.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML)
      if (!brokenClipboardAPI)
        event.dataTransfer.setData('text/plain', text)
      view.dragging = {
        slice,
        move: true,
      }
    }
  }

  /// @internal
  keydownCallback = () => {
    this.#hide()
    return false
  }

  /// @internal
  #mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (!view.editable)
      return

    if (this.#hovering)
      return

    if (this.#dragging)
      return

    const { y } = event
    const x = view.dom.getBoundingClientRect().width / 2
    const dom = document.elementFromPoint(x, y)
    if (!(dom instanceof Element)) {
      this.#hide()
      return
    }

    const filterNodes = this.#filterNodes
    if (!filterNodes)
      return

    const result = selectRootNodeByDom(dom, view, filterNodes)

    if (!result) {
      this.#hide()
      return
    }
    this.#show(result)
  }

  /// @internal
  mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (view.composing || !view.editable)
      return false

    debounce(this.#mousemoveCallback, 20)(view, event)

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
  dragenterCallback = () => {
    this.#dragging = true
  }

  /// @internal
  dragleaveCallback = () => {
    this.#dragging = false
    this.#active = null
    this.#hovering = false
  }

  /// @internal
  dropCallback = (view: EditorView, _event: MouseEvent) => {
    const event = _event as DragEvent
    const tr = removePossibleTable(view, event)

    this.#dragging = false

    if (tr) {
      view.dispatch(tr)

      event.preventDefault()

      return true
    }

    return false
  }
}
