import type { Node } from '@milkdown/prose/model'
import type { NodeViewConstructor } from '@milkdown/prose/view'

import { listItemSchema } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { $view } from '@milkdown/utils'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../__internal__/meta'
import { ListItem } from './component'
import { listItemBlockConfig } from './config'

export const listItemBlockView = $view(
  listItemSchema.node,
  (ctx): NodeViewConstructor => {
    return (initialNode, view, getPos) => {
      const dom = document.createElement('div')
      dom.className = 'milkdown-list-item-block'

      const contentDOM = document.createElement('div')
      contentDOM.setAttribute('data-content-dom', 'true')
      contentDOM.classList.add('content-dom')

      const label = ref(initialNode.attrs.label)
      const checked = ref(initialNode.attrs.checked)
      const listType = ref(initialNode.attrs.listType)
      const readonly = ref(!view.editable)
      const config = ctx.get(listItemBlockConfig.key)
      const selected = ref(false)
      const setAttr = (attr: string, value: unknown) => {
        if (!view.editable) return
        const pos = getPos()
        if (pos == null) return
        view.dispatch(view.state.tr.setNodeAttribute(pos, attr, value))
      }
      const disposeSelectedWatcher = watchEffect(() => {
        const isSelected = selected.value
        if (isSelected) {
          dom.classList.add('selected')
        } else {
          dom.classList.remove('selected')
        }
      })
      const onMount = (div: HTMLElement) => {
        const { anchor, head } = view.state.selection
        div.appendChild(contentDOM)
        // put the cursor to the new created list item
        requestAnimationFrame(() => {
          const anchorPos = view.state.doc.resolve(anchor)
          const headPos = view.state.doc.resolve(head)
          view.dispatch(
            view.state.tr.setSelection(new TextSelection(anchorPos, headPos))
          )
        })
      }

      const app = createApp(ListItem, {
        label,
        checked,
        listType,
        readonly,
        config,
        selected,
        setAttr,
        onMount,
      })
      app.mount(dom)
      const bindAttrs = (node: Node) => {
        listType.value = node.attrs.listType
        label.value = node.attrs.label
        checked.value = node.attrs.checked
        readonly.value = !view.editable
      }

      bindAttrs(initialNode)
      let node = initialNode
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
          selected.value = true
        },
        deselectNode: () => {
          selected.value = false
        },
        destroy: () => {
          disposeSelectedWatcher()
          app.unmount()
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
