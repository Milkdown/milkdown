import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'
import type { EditorView } from '@milkdown/prose/view'
import { listItemSchema } from '../node/list-item'

import { orderedListSchema } from '../node/ordered-list'
import { bulletListSchema } from '../node'
import { withMeta } from '../__internal__'

/// This plugin is used to keep the label of list item up to date in ordered list.
export const syncListOrderPlugin = $prose((ctx) => {
  const syncOrderLabel = (view: EditorView) => {
    if (view.composing || !view.editable) return

    const orderedListType = orderedListSchema.type(ctx)
    const bulletListType = bulletListSchema.type(ctx)
    const listItemType = listItemSchema.type(ctx)
    const state = view.state
    const handleNodeItem = (
      attrs: Record<string, any>,
      index: number
    ): boolean => {
      let changed = false
      const expectedLabel = `${index + 1}.`
      if (attrs.label !== expectedLabel) {
        attrs.label = expectedLabel
        changed = true
      }

      return changed
    }

    let tr = state.tr
    let needDispatch = false
    state.doc.descendants((node, pos, parent, index) => {
      if (node.type === bulletListType) {
        const base = node.maybeChild(0)
        if (base?.type === listItemType && base.attrs.listType === 'ordered') {
          needDispatch = true
          tr.setNodeMarkup(pos, orderedListType, { spread: 'true' })

          node.descendants((child, pos, _parent, index) => {
            if (child.type === listItemType) {
              const attrs = { ...child.attrs }
              const changed = handleNodeItem(attrs, index)
              if (changed) tr = tr.setNodeMarkup(pos, undefined, attrs)
            }
            return false
          })
        }
      } else if (
        node.type === listItemType &&
        parent?.type === orderedListType
      ) {
        const attrs = { ...node.attrs }
        let changed = false
        if (attrs.listType !== 'ordered') {
          attrs.listType = 'ordered'
          changed = true
        }

        const base = parent?.maybeChild(0)
        if (base) changed = handleNodeItem(attrs, index)

        if (changed) {
          tr = tr.setNodeMarkup(pos, undefined, attrs)
          needDispatch = true
        }
      }
    })

    if (needDispatch) view.dispatch(tr.setMeta('addToHistory', false))
  }
  return new Plugin({
    key: new PluginKey('MILKDOWN_KEEP_LIST_ORDER'),
    view: (view) => {
      syncOrderLabel(view)
      return {
        update: (view) => {
          syncOrderLabel(view)
        },
      }
    },
  })
})

withMeta(syncListOrderPlugin, {
  displayName: 'Prose<syncListOrderPlugin>',
  group: 'Prose',
})
