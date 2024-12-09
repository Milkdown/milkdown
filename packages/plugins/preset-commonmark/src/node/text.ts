import { $node } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// The bottom-level node.
export const textSchema = $node('text', () => ({
  group: 'inline',
  parseMarkdown: {
    match: ({ type }) => type === 'text',
    runner: (state, node) => {
      state.addText(node.value as string)
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'text',
    runner: (state, node) => {
      state.addNode('text', undefined, node.text as string)
    },
  },
}))

withMeta(textSchema, {
  displayName: 'NodeSchema<text>',
  group: 'Text',
})
