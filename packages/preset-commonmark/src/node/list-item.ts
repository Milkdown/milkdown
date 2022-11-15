/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { getNodeFromSchema } from '@milkdown/prose'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import type { NodeType } from '@milkdown/prose/model'
import { liftListItem, sinkListItem, splitListItem } from '@milkdown/prose/schema-list'
import type { EditorState, Transaction } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem']

const id = 'list_item'

export const SplitListItem = createCmdKey('SplitListItem')
export const SinkListItem = createCmdKey('SinkListItem')
export const LiftListItem = createCmdKey('LiftListItem')

const keepListOrderPluginKey = new PluginKey('MILKDOWN_KEEP_LIST_ORDER')

const createKeepListOrderPlugin = (type: NodeType) => {
  const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
    const orderedListType = getNodeFromSchema('ordered_list', state.schema)
    let tr = state.tr
    state.doc.descendants((node, pos, parent, index) => {
      if (node.type === type && parent?.type === orderedListType) {
        let changed = false
        const attrs = { ...node.attrs }
        if (node.attrs.listType !== 'ordered') {
          attrs.listType = 'ordered'
          changed = true
        }

        const base = parent?.maybeChild(0)
        if (base && base.type === type && base.attrs.listType === 'ordered') {
          attrs.label = `${index + 1}.`
          changed = true
        }

        if (node.attrs.label === '•') {
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
    key: keepListOrderPluginKey,
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
}

export const listItem = createNode<Keys>(utils => ({
  id,
  schema: () => ({
    group: 'listItem',
    content: 'paragraph block*',
    attrs: {
      label: {
        default: '•',
      },
      listType: {
        default: 'bullet',
      },
      spread: {
        default: 'true',
      },
    },
    defining: true,
    parseDOM: [
      {
        tag: 'li.list-item',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return {
            label: dom.dataset.label,
            listType: dom.dataset['list-type'],
            spread: dom.dataset.spread,
          }
        },
        contentElement: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          const body = dom.querySelector<HTMLElement>('.list-item_body')
          if (!body)
            return dom

          return body
        },
      },
      { tag: 'li' },
    ],
    toDOM: (node) => {
      return [
        'li',
        {
          'class': utils.getClassName(node.attrs, 'list-item'),
          'data-label': node.attrs.label,
          'data-list-type': node.attrs.listType,
          'data-spread': node.attrs.spread,
        },
        ['div', { class: utils.getClassName(node.attrs, 'list-item_label') }, node.attrs.label],
        ['div', { class: utils.getClassName(node.attrs, 'list-item_body') }, 0],
      ]
    },
    parseMarkdown: {
      match: ({ type, checked }) => type === 'listItem' && checked === null,
      runner: (state, node, type) => {
        const label = node.label != null ? `${node.label}.` : '•'
        const listType = node.label != null ? 'ordered' : 'bullet'
        const spread = node.spread != null ? `${node.spread}` : 'true'
        state.openNode(type, { label, listType, spread })
        state.next(node.children)
        state.closeNode()
      },
    },
    toMarkdown: {
      match: node => node.type.name === id,
      runner: (state, node) => {
        state.openNode('listItem', undefined, { spread: node.attrs.spread === 'true' })
        state.next(node.content)
        state.closeNode()
      },
    },
  }),
  inputRules: nodeType => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
  commands: nodeType => [
    createCmd(SplitListItem, () => splitListItem(nodeType)),
    createCmd(SinkListItem, () => sinkListItem(nodeType)),
    createCmd(LiftListItem, () => liftListItem(nodeType)),
  ],
  shortcuts: {
    [SupportedKeys.NextListItem]: createShortcut(SplitListItem, 'Enter'),
    [SupportedKeys.SinkListItem]: createShortcut(SinkListItem, 'Mod-]'),
    [SupportedKeys.LiftListItem]: createShortcut(LiftListItem, 'Mod-['),
  },
  prosePlugins: nodeType => [createKeepListOrderPlugin(nodeType)],
}))
