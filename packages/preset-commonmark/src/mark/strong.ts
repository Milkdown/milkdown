/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { createMark, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['Bold']
const id = 'strong'
export const ToggleBold = createCmdKey('ToggleBold')
export const strong = createMark<Keys>((utils) => {
  return {
    id,
    schema: () => ({
      inclusive: false,
      parseDOM: [
        { tag: 'b' },
        { tag: 'strong' },
        { style: 'font-style', getAttrs: value => (value === 'bold') as false },
      ],
      toDOM: mark => ['strong', { class: utils.getClassName(mark.attrs, id) }],
      parseMarkdown: {
        match: node => node.type === 'strong',
        runner: (state, node, markType) => {
          state.openMark(markType)
          state.next(node.children)
          state.closeMark(markType)
        },
      },
      toMarkdown: {
        match: mark => mark.type.name === id,
        runner: (state, mark) => {
          state.withMark(mark, 'strong')
        },
      },
    }),
    commands: markType => [createCmd(ToggleBold, () => toggleMark(markType))],
    shortcuts: {
      [SupportedKeys.Bold]: createShortcut(ToggleBold, 'Mod-b'),
    },
  }
})
