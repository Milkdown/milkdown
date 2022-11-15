/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { expectDomTypeError } from '@milkdown/exception'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['BulletList']

export const WrapInBulletList = createCmdKey('WrapInBulletList')

export const bulletList = createNode<Keys>((utils) => {
  const id = 'bullet_list'
  return {
    id,
    schema: () => ({
      content: 'listItem+',
      group: 'block',
      attrs: {
        spread: {
          default: false,
        },
      },
      parseDOM: [
        {
          tag: 'ul',
          getAttrs: (dom) => {
            if (!(dom instanceof HTMLElement))
              throw expectDomTypeError(dom)

            return {
              spread: dom.dataset.spread,
            }
          },
        },
      ],
      toDOM: (node) => {
        return [
          'ul',
          {
            'data-spread': node.attrs.spread,
            'class': utils.getClassName(node.attrs, 'bullet-list'),
          },
          0,
        ]
      },
      parseMarkdown: {
        match: ({ type, ordered }) => type === 'list' && !ordered,
        runner: (state, node, type) => {
          const spread = node.spread != null ? `${node.spread}` : 'false'
          state.openNode(type, { spread }).next(node.children).closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === id,
        runner: (state, node) => {
          state
            .openNode('list', undefined, { ordered: false, spread: node.attrs.spread === 'true' })
            .next(node.content)
            .closeNode()
        },
      },
    }),
    inputRules: nodeType => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
    commands: nodeType => [createCmd(WrapInBulletList, () => wrapIn(nodeType))],
    shortcuts: {
      [SupportedKeys.BulletList]: createShortcut(WrapInBulletList, 'Mod-Alt-8'),
    },
  }
})
