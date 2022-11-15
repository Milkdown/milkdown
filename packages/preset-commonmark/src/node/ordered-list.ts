/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['OrderedList']

export const WrapInOrderedList = createCmdKey('WrapInOrderedList')

const id = 'ordered_list'
export const orderedList = createNode<Keys>(utils => ({
  id,
  schema: () => ({
    content: 'listItem+',
    group: 'block',
    attrs: {
      order: {
        default: 1,
      },
      spread: {
        default: false,
      },
    },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return {
            spread: dom.dataset.spread,
            order: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) : 1,
          }
        },
      },
    ],
    toDOM: node => [
      'ol',
      {
        ...(node.attrs.order === 1 ? {} : node.attrs.order),
        'data-spread': node.attrs.spread,
        'class': utils.getClassName(node.attrs, 'ordered-list'),
      },
      0,
    ],
    parseMarkdown: {
      match: ({ type, ordered }) => type === 'list' && !!ordered,
      runner: (state, node, type) => {
        const spread = node.spread != null ? `${node.spread}` : 'true'
        state.openNode(type, { spread }).next(node.children).closeNode()
      },
    },
    toMarkdown: {
      match: node => node.type.name === id,
      runner: (state, node) => {
        state.openNode('list', undefined, { ordered: true, start: 1, spread: node.attrs.spread === 'true' })
        state.next(node.content)
        state.closeNode()
      },
    },
  }),
  inputRules: nodeType => [
    wrappingInputRule(
      /^(\d+)\.\s$/,
      nodeType,
      match => ({ order: Number(match[1]) }),
      (match, node) => node.childCount + node.attrs.order === Number(match[1]),
    ),
  ],
  commands: nodeType => [createCmd(WrapInOrderedList, () => wrapIn(nodeType))],
  shortcuts: {
    [SupportedKeys.OrderedList]: createShortcut(WrapInOrderedList, 'Mod-Alt-7'),
  },
}))
