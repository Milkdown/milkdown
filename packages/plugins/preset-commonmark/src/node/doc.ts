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
      // The last empty paragraph is the typing area, not content. Skip
      // it, so it does not serialize as an empty-line placeholder. See
      // `paragraphSchema`. The skip works by index, so it also covers a
      // synthetic document such as a clipboard slice or a ranged
      // `getMarkdown`. A selection that ends with a blank line drops
      // that blank line from the output on purpose.
      const last = node.childCount > 0 ? node.child(node.childCount - 1) : null
      const content =
        last?.type.name === 'paragraph' && last.content.size === 0
          ? node.content.cut(0, node.content.size - last.nodeSize)
          : node.content
      state.next(content)
    },
  },
}))

withMeta(docSchema, {
  displayName: 'NodeSchema<doc>',
  group: 'Doc',
})
