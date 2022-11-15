/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core'
import { toggleMark } from '@milkdown/prose/commands'
import { createMark, createShortcut } from '@milkdown/utils'

import { SupportedKeys } from '../supported-keys'

type Keys = SupportedKeys['Em']

const id = 'em'

export const ToggleItalic = createCmdKey('ToggleItalic')
export const em = createMark<Keys>(utils => ({
  id,
  schema: () => ({
    inclusive: false,
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style', getAttrs: value => (value === 'italic') as false },
    ],
    toDOM: mark => ['em', { class: utils.getClassName(mark.attrs, id) }],
    parseMarkdown: {
      match: node => node.type === 'emphasis',
      runner: (state, node, markType) => {
        state.openMark(markType)
        state.next(node.children)
        state.closeMark(markType)
      },
    },
    toMarkdown: {
      match: mark => mark.type.name === id,
      runner: (state, mark) => {
        state.withMark(mark, 'emphasis')
      },
    },
  }),
  commands: markType => [createCmd(ToggleItalic, () => toggleMark(markType))],
  shortcuts: {
    [SupportedKeys.Em]: createShortcut(ToggleItalic, 'Mod-i'),
  },
}))
