/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { setBlockType } from '@milkdown/prose/commands'
import type { Node } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'
import { createNode, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['Text']

export const TurnIntoText = createCmdKey('TurnIntoText')

const id = 'paragraph'
export const paragraph = createNode<Keys>((utils) => {
  return {
    id,
    schema: () => ({
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: node => ['p', { class: utils.getClassName(node.attrs, id) }, 0],
      parseMarkdown: {
        match: node => node.type === 'paragraph',
        runner: (state, node, type) => {
          state.openNode(type)
          if (node.children)
            state.next(node.children)
          else
            state.addText(node.value as string)

          state.closeNode()
        },
      },
      toMarkdown: {
        match: node => node.type.name === 'paragraph',
        runner: (state, node) => {
          state.openNode('paragraph')
          const lastIsHardbreak = node.childCount >= 1 && node.lastChild?.type.name === 'hardbreak'
          if (lastIsHardbreak) {
            const contentArr: Node[] = []
            node.content.forEach((n, _, i) => {
              if (i === node.childCount - 1)
                return

              contentArr.push(n)
            })
            state.next(Fragment.fromArray(contentArr))
          }
          else {
            state.next(node.content)
          }
          state.closeNode()
        },
      },
    }),
    commands: nodeType => [createCmd(TurnIntoText, () => setBlockType(nodeType))],
    shortcuts: {
      [SupportedKeys.Text]: createShortcut(TurnIntoText, 'Mod-Alt-0'),
    },
  }
})
