import { $node } from '@milkdown/utils'
import { withMeta } from '../__internal__'

/// The top-level document node.
export const docSchema = $node('doc', () => ({
  content: 'block+',
  parseMarkdown: {
    match: ({ type }) => type === 'root',
    runner: (state, node, type) => {
      state.injectRoot(node, type)
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'doc',
    runner: (state, node) => {
      state.openNode('root')
      state.next(node.content)
    },
  },
}))

withMeta(docSchema, {
  displayName: 'NodeSchema<doc>',
  group: 'Doc',
})
