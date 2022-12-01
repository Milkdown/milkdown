/* Copyright 2021, Milkdown by Mirone. */
import { $node } from '@milkdown/utils'

export const textSchema = $node('text', () => ({
  group: 'inline',
  parseMarkdown: {
    match: ({ type }) => type === 'text',
    runner: (state, node) => {
      state.addText(node.value as string)
    },
  },
  toMarkdown: {
    match: node => node.type.name === 'text',
    runner: (state, node) => {
      state.addNode('text', undefined, node.text as string)
    },
  },
}))

