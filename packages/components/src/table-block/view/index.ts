import { $view } from '@milkdown/utils'
import { tableSchema } from '@milkdown/preset-gfm'
import type { Node } from '@milkdown/prose/model'
import type { EditorView, NodeView, NodeViewConstructor } from '@milkdown/prose/view'
import type { Ctx } from '@milkdown/ctx'
import { defIfNotExists } from '../../__internal__/helper'
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

  stopEvent(e: Event) {
    if (['drop', 'dragstart', 'dragover', 'dragend', 'dragleave'].includes(e.type))
      return true

    if (e.type === 'mousedown' && e.target instanceof HTMLButtonElement)
      return true

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
export const tableView = $view(tableSchema.node, (ctx): NodeViewConstructor => {
  return (initialNode, view, getPos) => {
    return new TableNodeView(ctx, initialNode, view, getPos)
  }
})
