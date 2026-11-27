import type { Node } from '@milkdown/prose/model'
import type { EditorView, NodeViewConstructor } from '@milkdown/prose/view'

import { listItemSchema } from '@milkdown/preset-commonmark'
import { TextSelection } from '@milkdown/prose/state'
import { $view } from '@milkdown/utils'
import { createApp, ref, watchEffect } from 'vue'

import { withMeta } from '../__internal__/meta'
import { ListItem } from './component'
import { listItemBlockConfig } from './config'

interface CapturedSelection {
  anchor: number
  head: number
  doc: Node
}

interface PendingRestore {
  captures: Map<HTMLElement, CapturedSelection>
  frameId: number
  cancel: () => void
}

// User actions that happen before the next frame leave the selection alone.
const userInputEvents = [
  'keydown',
  'pointerdown',
  'beforeinput',
  'input',
  'paste',
  'cut',
  'drop',
  'compositionstart',
] as const

// Each list item restores the selection that it saw at mount, one frame later.
// One dispatch per item runs every plugin once per item, so the cost grows
// with the square of the document size. Only the last valid restore decides
// the final selection. Thus each view keeps its captures in mount order and
// dispatches once. It uses the latest capture that fits the unchanged
// document, unless user input cancels the restore first.
const pendingRestores = new WeakMap<EditorView, PendingRestore>()

function getInputTargets(view: EditorView): EventTarget[] {
  const targets = new Set<EventTarget>()
  const doc = view.dom.ownerDocument
  // Listen on Window so listeners added during Window capture ignore that
  // event. Also watch ShadowRoot for non-composed events, and `view.dom` when
  // detached.
  if (doc?.defaultView) targets.add(doc.defaultView)
  else if (doc) targets.add(doc)
  if (view.root && view.root !== doc) targets.add(view.root)
  if (!view.dom.isConnected) targets.add(view.dom)
  return Array.from(targets)
}

function scheduleRestore(
  view: EditorView,
  item: HTMLElement,
  capture: CapturedSelection
) {
  const pending = pendingRestores.get(view)
  if (!pending) {
    const captures = new Map<HTMLElement, CapturedSelection>()
    const targets = getInputTargets(view)
    let active = true

    const deactivate = () => {
      if (!active) return false
      active = false
      for (const target of targets) {
        for (const type of userInputEvents) {
          target.removeEventListener(type, cancel, true)
        }
      }
      if (pendingRestores.get(view) === pending) {
        pendingRestores.delete(view)
      }
      return true
    }

    const cancel = () => {
      if (!deactivate()) return
      captures.clear()
      cancelAnimationFrame(pending.frameId)
    }

    const pending: PendingRestore = {
      captures,
      frameId: 0,
      cancel,
    }
    pendingRestores.set(view, pending)
    captures.set(item, capture)

    for (const target of targets) {
      for (const type of userInputEvents) {
        target.addEventListener(type, cancel, true)
      }
    }

    pending.frameId = requestAnimationFrame(() => {
      if (!deactivate() || view.isDestroyed) return
      const { state } = view
      const docSize = state.doc.content.size
      let last: CapturedSelection | undefined
      for (const entry of captures.values()) {
        if (entry.anchor <= docSize && entry.head <= docSize) last = entry
      }
      if (!last || last.doc !== state.doc) return
      const anchorPos = state.doc.resolve(last.anchor)
      const headPos = state.doc.resolve(last.head)
      // `between` falls back to the nearest valid selection when the
      // resolved positions no longer sit inside a textblock.
      const selection = TextSelection.between(anchorPos, headPos)
      view.dispatch(state.tr.setSelection(selection))
    })
    return
  }
  // A re-mount moves the item to the end, because its capture is the newest.
  pending.captures.delete(item)
  pending.captures.set(item, capture)
}

function cancelItemRestore(view: EditorView, item: HTMLElement) {
  const pending = pendingRestores.get(view)
  if (!pending) return
  pending.captures.delete(item)
  if (pending.captures.size === 0) {
    pending.cancel()
  }
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

        const {
          doc,
          selection: { anchor, head },
        } = view.state
        div.appendChild(contentDOM)
        // put the cursor to the new created list item
        scheduleRestore(view, dom, { anchor, head, doc })
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
          cancelItemRestore(view, dom)
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
