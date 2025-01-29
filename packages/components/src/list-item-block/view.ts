import { $view } from '@milkdown/utils'
import type { NodeViewConstructor } from '@milkdown/prose/view'
import { TextSelection } from '@milkdown/prose/state'
import type { Node } from '@milkdown/prose/model'
import { listItemSchema } from '@milkdown/preset-commonmark'
import { withMeta } from '../__internal__/meta'
import { defIfNotExists } from '../__internal__/helper'
import type { ListItemComponentProps } from './component'
import { ListItemElement } from './component'
import { listItemBlockConfig } from './config'

defIfNotExists('milkdown-list-item-block', ListItemElement)
export const listItemBlockView = $view(
  listItemSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      const dom = document.createElement(
        'milkdown-list-item-block'
      ) as HTMLElement & ListItemComponentProps
      const contentDOM = document.createElement('div')
      contentDOM.setAttribute('data-content-dom', 'true')
      contentDOM.classList.add('content-dom')
      const config = ctx.get(listItemBlockConfig.key)
      const bindAttrs = (node: Node) => {
        dom.listType = node.attrs.listType
        dom.label = node.attrs.label
        dom.checked = node.attrs.checked

        dom.readonly = !view.editable
      }

      bindAttrs(initialNode)
      dom.appendChild(contentDOM)
      dom.selected = false
      dom.setAttr = (attr, value) => {
        const pos = getPos()
        if (pos == null) return

        view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value))
      }
      dom.onMount = () => {
        const { anchor, head } = view.state.selection
        if (view.hasFocus()) {
          setTimeout(() => {
            const anchorPos = view.state.doc.resolve(anchor)
            const headPos = view.state.doc.resolve(head)
            view.dispatch(
              view.state.tr.setSelection(new TextSelection(anchorPos, headPos))
            )
          })
        }
      }
      let node = initialNode
      dom.config = config
      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== initialNode.type) return false

          if (
            updatedNode.sameMarkup(node) &&
            updatedNode.content.eq(node.content)
          )
            return true

          node = updatedNode
          bindAttrs(updatedNode)
          return true
        },
        ignoreMutation: (mutation) => {
          if (!dom || !contentDOM) return true

          if ((mutation.type as unknown) === 'selection') return false

          if (contentDOM === mutation.target && mutation.type === 'attributes')
            return true

          if (contentDOM.contains(mutation.target)) return false

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
  }
)

withMeta(listItemBlockView, {
  displayName: 'NodeView<list-item-block>',
  group: 'ListItemBlock',
})
