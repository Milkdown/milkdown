/* Copyright 2021, Milkdown by Mirone. */
import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { TextSelection } from '@milkdown/prose/state'
import { c } from 'atomico'
import type { Node } from '@milkdown/prose/lib/model'
import { listItemSchema } from '@milkdown/preset-commonmark'
import type { ListItemComponentProps } from './component'
import { listItemComponent } from './component'
import { listItemBlockConfig } from './config'

export const listItemBlockView = $view(listItemSchema.node, (ctx): NodeViewConstructor => {
  customElements.define('milkdown-list-item-block', c(listItemComponent))

  return (initialNode, view, getPos) => {
    const dom = document.createElement('milkdown-list-item-block') as HTMLElement & ListItemComponentProps
    const contentDOM = document.createElement('div')
    contentDOM.setAttribute('data-content-dom', 'true')
    contentDOM.classList.add('content-dom')
    const config = ctx.get(listItemBlockConfig.key)
    const bindAttrs = (node: Node) => {
      dom.listType = node.attrs.listType
      dom.label = node.attrs.label
      dom.checked = node.attrs.checked
    }

    bindAttrs(initialNode)
    dom.appendChild(contentDOM)
    dom.selected = false
    dom.setAttr = (attr, value) => {
      const pos = getPos()
      if (pos == null)
        return

      view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value))
    }
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
    dom.config = config
    return {
      dom,
      contentDOM,
      update: (updatedNode) => {
        if (updatedNode.type !== initialNode.type)
          return false

        if (updatedNode.sameMarkup(node) && updatedNode.content.eq(node.content))
          return false

        node = updatedNode
        bindAttrs(updatedNode)
        return true
      },
      stopEvent: (e) => {
        if (dom.selected && e.target instanceof HTMLInputElement)
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
      selectNode: () => {
        dom.selected = true
      },
      deselectNode: () => {
        dom.selected = false
      },
      destroy: () => {
        dom.remove()
        contentDOM.remove()
      },
    }
  }
})
