/* Copyright 2021, Milkdown by Mirone. */
import type { EditorState, Transaction } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'
import { listItemSchema } from '../node/list-item'

import { orderedListSchema } from '../node/ordered-list'

// This plugin is used to keep the label of list item up to date in ordered list.
export const syncListOrderPlugin = $prose(() => {
  const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
    const orderedListType = orderedListSchema.type
    const listItemType = listItemSchema.type
    let tr = state.tr
    state.doc.descendants((node, pos, parent, index) => {
      if (node.type === listItemType && parent?.type === orderedListType) {
        let changed = false
        const attrs = { ...node.attrs }
        if (node.attrs.listType !== 'ordered') {
          attrs.listType = 'ordered'
          changed = true
        }

        const base = parent?.maybeChild(0)
        if (base === node) {
          attrs.label = '1.'
          changed = true
        }
        else if (base?.type === listItemType && base.attrs.listType === 'ordered') {
          attrs.label = `${index + 1}.`
          changed = true
        }
        else if (node.attrs.label === '•') {
          attrs.label = `${index + 1}.`
          changed = true
        }

        if (changed)
          tr = tr.setNodeMarkup(pos, undefined, attrs)
      }
    })
    callback(tr)
  }
  return new Plugin({
    key: new PluginKey('MILKDOWN_KEEP_LIST_ORDER'),
    appendTransaction: (transactions, _oldState, nextState) => {
      let tr: Transaction | null = null
      if (transactions.some(transaction => transaction.docChanged)) {
        walkThrough(nextState, (t) => {
          tr = t
        })
      }

      return tr
    },
  })
})
