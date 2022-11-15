/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { wrapIn } from '@milkdown/prose/commands'
import { wrappingInputRule } from '@milkdown/prose/inputrules'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['Blockquote']

const id = 'blockquote'

export const WrapInBlockquote = createCmdKey('WrapInBlockquote')

export const blockquote = createNode<Keys>((utils) => {
  return {
    id,
    schema: () => ({
      content: 'block+',
      group: 'block',
      defining: true,
      parseDOM: [{ tag: 'blockquote' }],
      toDOM: node => ['blockquote', { class: utils.getClassName(node.attrs, id) }, 0],
      parseMarkdown: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
          state.openNode(type).next(node.children).closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === id,
        runner: (state, node) => {
          state.openNode('blockquote').next(node.content).closeNode()
        },
      },
    }),
    inputRules: nodeType => [wrappingInputRule(/^\s*>\s$/, nodeType)],
    commands: nodeType => [createCmd(WrapInBlockquote, () => wrapIn(nodeType))],
    shortcuts: {
      [SupportedKeys.Blockquote]: createShortcut(WrapInBlockquote, 'Mod-Shift-b'),
    },
  }
})
