import type { Node } from '@milkdown/prose/model'
import type { Selection } from '@milkdown/prose/state'
import type { EditorView, NodeViewConstructor } from '@milkdown/prose/view'

import { listItemSchema } from '@milkdown/preset-commonmark'
import { $view } from '@milkdown/utils'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../__internal__/meta'
import { ListItem } from './component'
import { listItemBlockConfig } from './config'

// Each list item restores the selection that it saw at mount, one frame later.
// One dispatch per item runs every plugin once per item, so the cost grows
// with the square of the document size. Only the last restore decides the
// final selection. Thus each view keeps its captures in mount order and
// dispatches once, with the latest capture.
// A capture applies only to the document it was taken from. Text typed within
// the frame changes the document, and a restore would put the caret before it.
// So any document change in the frame cancels the restore. A selection change
// does not cancel it, because the browser moving the caret after the mount is
// a selection change, and undoing that move is the point of the restore.
const pendingRestores = new WeakMap<EditorView, Map<HTMLElement, Selection>>()

function scheduleRestore(
  view: EditorView,
  item: HTMLElement,
  selection: Selection
) {
  let captures = pendingRestores.get(view)
  if (!captures) {
    const frameCaptures = new Map<HTMLElement, Selection>()
    captures = frameCaptures
    pendingRestores.set(view, frameCaptures)
    requestAnimationFrame(() => {
      pendingRestores.delete(view)
      if (view.isDestroyed) return
      const { state } = view
      let last: Selection | undefined
      for (const entry of frameCaptures.values()) last = entry
      if (!last || last.$anchor.doc !== state.doc) return
      // Dispatch even when the selection is equal. syncListOrderPlugin skips
      // transactions with metadata, such as a drop, and relies on this
      // generic transaction to normalize a moved list item.
      view.dispatch(state.tr.setSelection(last))
    })
  }
  // All captures in the map share one document. A capture from a newer
  // document makes the older ones useless, so drop them now. Otherwise a
  // background tab, where frames do not run, keeps every old document alive.
  const first = captures.values().next().value
  if (first && first.$anchor.doc !== selection.$anchor.doc) captures.clear()
  // A re-mount moves the item to the end, because its capture is the newest.
  captures.delete(item)
  captures.set(item, selection)
}

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

        if (!view.hasFocus()) view.focus()

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
      let mountedDiv: HTMLElement | null = null
      const onMount = (div: HTMLElement) => {
        // Vue invokes function refs on every patch, not only on mount.
        // Re-running this would dispatch a text selection over whatever is
        // currently selected, clobbering the node selection created by the
        // block handle.
        if (div === mountedDiv) return
        mountedDiv = div

        const { selection } = view.state
        div.appendChild(contentDOM)
        // put the cursor to the new created list item
        scheduleRestore(view, dom, selection)
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
          pendingRestores.get(view)?.delete(dom)
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
