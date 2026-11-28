import type { Ctx } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import type {
  EditorView,
  NodeView,
  NodeViewConstructor,
  ViewMutationRecord,
} from '@milkdown/prose/view'

import { tableSchema } from '@milkdown/preset-gfm'
import { findParent } from '@milkdown/prose'
import { NodeSelection, TextSelection } from '@milkdown/prose/state'
import { CellSelection } from '@milkdown/prose/tables'
import { $view } from '@milkdown/utils'
import { createApp, shallowRef, type App, type ShallowRef } from 'vue'

import { withMeta } from '../../__internal__/meta'
import { tableBlockConfig } from '../config'
import { TableBlock } from './component'

export class TableNodeView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  app: App

  nodeRef: ShallowRef<Node>

  constructor(
    public ctx: Ctx,
    public node: Node,
    public view: EditorView,
    public getPos: () => number | undefined
  ) {
    const dom = document.createElement('div')
    dom.className = 'milkdown-table-block'

    const contentDOM = document.createElement('tbody')
    this.contentDOM = contentDOM
    contentDOM.setAttribute('data-content-dom', 'true')
    contentDOM.classList.add('content-dom')
    this.nodeRef = shallowRef(node)

    const app = createApp(TableBlock, {
      view,
      ctx,
      getPos,
      config: ctx.get(tableBlockConfig.key),
      onMount: (div: Element) => {
        div.appendChild(contentDOM)
      },
      node: this.nodeRef,
    })
    app.mount(dom)
    this.app = app

    this.dom = dom
  }

  update(node: Node) {
    if (node.type !== this.node.type) return false

    if (node.sameMarkup(this.node) && node.content.eq(this.node.content))
      return false

    this.node = node
    this.nodeRef.value = node

    return true
  }

  #handleClick(event: PointerEvent) {
    const view = this.view
    if (!view.editable) return false

    const { state } = view
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })

    if (!pos) return false

    const $pos = state.doc.resolve(pos.inside)
    const node = findParent(
      (node) =>
        node.type.name === 'table_cell' || node.type.name === 'table_header'
    )($pos)

    if (!node) return false

    // A click inside the cell that already holds the caret keeps the
    // text selection instead of replacing it with a node selection.
    if (state.selection instanceof TextSelection) {
      const currentNode = findParent(
        (node) =>
          node.type.name === 'table_cell' || node.type.name === 'table_header'
      )(state.selection.$from)
      if (currentNode?.node === node.node) return false
    }

    const { from, to } = node

    const selection = NodeSelection.create(state.doc, from + 1)
    if (state.selection.eq(selection)) return false

    // The dispatch is deferred so it lands after the caret the browser places
    // for this click, which sits inside the clicked cell. Any other change
    // since the click is newer, so keep it. A changed document also makes
    // `selection` stale, so skip it too.
    const select = () => {
      const current = view.state
      if (current.doc !== state.doc) return

      const { selection: currentSelection } = current
      const placedByClick =
        currentSelection instanceof TextSelection &&
        currentSelection.from > from &&
        currentSelection.to < to
      if (!currentSelection.eq(state.selection) && !placedByClick) return

      view.dispatch(current.tr.setSelection(selection).scrollIntoView())
    }

    if (state.selection instanceof CellSelection) setTimeout(select, 20)
    else requestAnimationFrame(select)
    return true
  }

  stopEvent(e: Event) {
    if (e.type === 'drop' || e.type.startsWith('drag')) return true

    if (e.type !== 'mousedown' && e.type !== 'pointerdown') return false

    const target = e.target
    if (!(target instanceof Element)) return false

    // The handles and buttons around the table are not content.
    // prosemirror-view cancels the default action of a mousedown it handles,
    // which would keep the row and column drag handles from starting a drag.
    if (target.closest('button') || !this.contentDOM.contains(target))
      return true

    if (target.closest('th, td')) return this.#handleClick(e as PointerEvent)

    return false
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    if (!this.dom || !this.contentDOM) return true

    if ((mutation.type as unknown) === 'selection') return false

    if (this.contentDOM === mutation.target && mutation.type === 'attributes')
      return true

    if (this.contentDOM.contains(mutation.target)) return false

    return true
  }

  destroy() {
    this.app.unmount()
    this.dom.remove()
    this.contentDOM.remove()
  }
}

export const tableBlockView = $view(
  tableSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      return new TableNodeView(ctx, initialNode, view, getPos)
    }
  }
)

withMeta(tableBlockView, {
  displayName: 'NodeView<table-block>',
  group: 'TableBlock',
})
