import { $view } from '@milkdown/utils'
import { tableSchema } from '@milkdown/preset-gfm'
import type { Node } from '@milkdown/prose/model'
import type { EditorView, NodeView, NodeViewConstructor } from '@milkdown/prose/view'
import type { Ctx } from '@milkdown/ctx'
import { NodeSelection } from '@milkdown/prose/state'
import { findParent } from '@milkdown/prose'
import { CellSelection } from '@milkdown/prose/tables'
import { defIfNotExists } from '../../__internal__/helper'
import { tableBlockConfig } from '../config'
import { withMeta } from '../../__internal__/meta'
import type { TableComponentProps } from './component'
import { TableElement } from './component'

export class TableNodeView implements NodeView {
  dom: HTMLElement & TableComponentProps
  contentDOM: HTMLElement
  constructor(
    public ctx: Ctx,
    public node: Node,
    public view: EditorView,
    public getPos: () => number | undefined,
  ) {
    const dom = document.createElement('milkdown-table-block') as HTMLElement & TableComponentProps
    this.dom = dom
    dom.view = view
    dom.ctx = ctx
    dom.getPos = getPos
    dom.node = node
    dom.config = ctx.get(tableBlockConfig.key)

    const contentDOM = document.createElement('tbody')
    this.contentDOM = contentDOM
    contentDOM.setAttribute('data-content-dom', 'true')
    contentDOM.classList.add('content-dom')

    dom.appendChild(contentDOM)
  }

  update(node: Node) {
    if (node.type !== this.node.type)
      return false

    if (node.sameMarkup(this.node) && node.content.eq(this.node.content))
      return false

    this.node = node
    this.dom.node = node

    return true
  }

  #handleClick(event: PointerEvent) {
    const view = this.view
    if (!view.editable)
      return false

    const { state, dispatch } = view
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })

    if (!pos)
      return false

    const $pos = state.doc.resolve(pos.inside)
    const node = findParent(node => node.type.name === 'table_cell' || node.type.name === 'table_header')($pos)
    if (!node)
      return false

    const { from } = node

    const selection = NodeSelection.create(state.doc, from + 1)
    if (state.selection.eq(selection))
      return false

    if (state.selection instanceof CellSelection) {
      setTimeout(() => {
        dispatch(state.tr.setSelection(selection).scrollIntoView())
      }, 20)
    }
    else {
      requestAnimationFrame(() => {
        dispatch(state.tr.setSelection(selection).scrollIntoView())
      })
    }
    return true
  }

  stopEvent(e: Event) {
    if (e.type === 'drop' || e.type.startsWith('drag'))
      return true

    if (e.type === 'mousedown') {
      if (e.target instanceof HTMLButtonElement)
        return true

      const target = e.target
      if (target instanceof HTMLElement && (target.closest('th') || target.closest('td'))) {
        const event = e as PointerEvent
        return this.#handleClick(event)
      }
    }

    return false
  }

  ignoreMutation(mutation: MutationRecord) {
    if (!this.dom || !this.contentDOM)
      return true

    if ((mutation.type as unknown) === 'selection')
      return false

    if (this.contentDOM === mutation.target && mutation.type === 'attributes')
      return true

    if (this.contentDOM.contains(mutation.target))
      return false

    return true
  }
}

defIfNotExists('milkdown-table-block', TableElement)
export const tableBlockView = $view(tableSchema.node, (ctx): NodeViewConstructor => {
  return (initialNode, view, getPos) => {
    return new TableNodeView(ctx, initialNode, view, getPos)
  }
})

withMeta(tableBlockView, {
  displayName: 'NodeView<table-block>',
  group: 'TableBlock',
})
