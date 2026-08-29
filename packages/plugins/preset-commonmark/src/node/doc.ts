import type { Node } from '@milkdown/prose/model'

import { Fragment } from '@milkdown/prose/model'
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
      // The last empty paragraph is the typing area, not content: skip it
      // so it does not serialize as an empty-line placeholder (see
      // `paragraphSchema`). By index, so synthetic documents (clipboard
      // slices, ranged getMarkdown) behave the same as the editor's.
      let end = node.childCount
      const last = end > 0 ? node.child(end - 1) : null
      if (last?.type.name === 'paragraph' && last.content.size === 0) end--
      if (end === node.childCount) {
        state.next(node.content)
      } else {
        const children: Node[] = []
        for (let i = 0; i < end; i++) children.push(node.child(i))
        state.next(Fragment.fromArray(children))
      }
    },
  },
}))

withMeta(docSchema, {
  displayName: 'NodeSchema<doc>',
  group: 'Doc',
})
