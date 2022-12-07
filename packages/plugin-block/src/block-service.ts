/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import { browser } from '@milkdown/prose'
import type { Selection } from '@milkdown/prose/state'
import { NodeSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'

import type { FilterNodes } from './block-plugin'
import { blockConfig } from './block-plugin'
import { removePossibleTable } from './remove-possible-table'
import type { ActiveNode } from './select-node-by-dom'
import { selectRootNodeByDom } from './select-node-by-dom'
import { serializeForClipboard } from './serialize-for-clipboard'

const brokenClipboardAPI
    = (browser.ie && <number>browser.ie_version < 15) || (browser.ios && browser.webkit_version < 604)

const buffer = 20

export type BlockServiceMessageType = {
  type: 'hide'
} | {
  type: 'show'
  active: ActiveNode
}
export type BlockServiceMessage = (message: BlockServiceMessageType) => void

export class BlockService {
  #ctx?: Ctx

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

  #activeSelection: null | Selection = null
  #active: null | ActiveNode = null
  #activeDOMRect: undefined | DOMRect = undefined

  #dragging = false
  #hovering = false

  get #filterNodes(): FilterNodes | undefined {
    return this.#ctx?.get(blockConfig.key).filterNodes
  }

  get #view() {
    return this.#ctx?.get(editorViewCtx)
  }

  #notify?: BlockServiceMessage

  #hide = () => {
    this.#notify?.({ type: 'hide' })
    this.#hovering = false
    this.#active = null
  }

  #show = (active: ActiveNode) => {
    this.#active = active
    this.#notify?.({ type: 'show', active })
  }

  bind = (ctx: Ctx, notify: BlockServiceMessage) => {
    this.#ctx = ctx
    this.#notify = notify
  }

  addEvent = (dom: HTMLElement) => {
    dom.addEventListener('mousedown', this.#handleMouseDown)
    dom.addEventListener('mouseenter', this.#handleMouseEnter)
    dom.addEventListener('mouseleave', this.#handleMouseLeave)
    dom.addEventListener('mouseup', this.#handleMouseUp)
    dom.addEventListener('dragstart', this.#handleDragStart)
  }

  removeEvent = (dom: HTMLElement) => {
    dom.removeEventListener('mousedown', this.#handleMouseDown)
    dom.removeEventListener('mouseenter', this.#handleMouseEnter)
    dom.removeEventListener('mouseleave', this.#handleMouseLeave)
    dom.removeEventListener('mouseup', this.#handleMouseUp)
    dom.removeEventListener('dragstart', this.#handleDragStart)
  }

  unBind = () => {
    this.#notify = undefined
  }

  #handleMouseEnter = () => {
    this.#hovering = true
  }

  #handleMouseLeave = () => {
    this.#hovering = false
  }

  #handleMouseDown = () => {
    this.#activeDOMRect = this.#active?.el.getBoundingClientRect()
    this.#createSelection()
  }

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

  keydownCallback = () => {
    this.#hide()
    return false
  }

  #mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (!view.editable)
      return

    if (this.#hovering)
      return

    if (this.#dragging)
      return

    const dom = event.target
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

  mousemoveCallback = (view: EditorView, event: MouseEvent) => {
    if (view.composing || !view.editable)
      return false

    debounce(this.#mousemoveCallback, 200)(view, event)

    return false
  }

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

  dragleaveCallback = () => {
    this.#active = null
    this.#hovering = false
  }

  dropCallback = (view: EditorView, _event: MouseEvent) => {
    if (this.#dragging) {
      const event = _event as DragEvent
      const tr = removePossibleTable(view, event)

      this.#dragging = false

      if (tr) {
        view.dispatch(tr)

        event.preventDefault()

        return true
      }
    }
    return false
  }
}
