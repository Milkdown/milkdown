import { $view } from '@milkdown/utils'
import { tableSchema } from '@milkdown/preset-gfm'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { TextSelection } from '@milkdown/prose/state'
import { defIfNotExists } from '../../__internal__/helper'
import type { TableComponentProps } from './component'
import { TableElement } from './component'

defIfNotExists('milkdown-table-block', TableElement)
export const tableView = $view(tableSchema.node, (ctx): NodeViewConstructor => {
  return (initialNode, view, getPos) => {
    const dom = document.createElement('milkdown-table-block') as HTMLElement & TableComponentProps
    dom.view = view
    dom.ctx = ctx
    dom.getPos = getPos

    const contentDOM = document.createElement('tbody')
    contentDOM.setAttribute('data-content-dom', 'true')
    contentDOM.classList.add('content-dom')

    dom.appendChild(contentDOM)
    dom.onMount = () => {
      const pos = getPos() ?? 0
      const end = pos + initialNode.nodeSize
      const { from, to } = view.state.selection
      if (view.hasFocus() && pos < from && to < end) {
        Promise.resolve().then(() => {
          const p = view.state.doc.resolve(pos)
          view.dispatch(view.state.tr.setSelection(TextSelection.near(p, 1)))
        })
      }
    }
    let node = initialNode
    return {
      dom,
      contentDOM,
      update: (updatedNode) => {
        if (updatedNode.type !== initialNode.type)
          return false

        if (updatedNode.sameMarkup(node) && updatedNode.content.eq(node.content))
          return false

        node = updatedNode

        return true
      },
      stopEvent: (e) => {
        if (['drop', 'dragstart', 'dragover', 'dragend', 'dragleave'].includes(e.type))
          return true

        return false
      },
      ignoreMutation: (mutation) => {
        if (!dom || !contentDOM)
          return true

        if ((mutation.type as unknown) === 'selection')
          return false

        if (contentDOM === mutation.target && mutation.type === 'attributes')
          return true

        if (contentDOM.contains(mutation.target))
          return false

        return true
      },
      destroy: () => {
        dom.remove()
      },
    }
  }
})
