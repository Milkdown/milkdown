/* Copyright 2021, Milkdown by Mirone. */
import { $nodeAttr, $nodeSchema } from '@milkdown/utils'

export const htmlAttr = $nodeAttr('html')

export const htmlSchema = $nodeSchema('html', (ctx) => {
  return {
    content: 'text*',
    group: 'inline',
    inline: true,
    parseDOM: [{ tag: 'span[data-type="html"]' }],
    attrs: {
      value: {
        default: '',
      },
    },
    toDOM: (node) => {
      const attr = {
        ...ctx.get(htmlAttr.key)(node),
        'data-type': 'html',
      }
      return ['span', attr, 0]
    },
    parseMarkdown: {
      match: ({ type }) => Boolean(type === 'html'),
      runner: (state, node, type) => {
        state.openNode(type)
          .addText(node.value as string)
          .closeNode()
      },
    },
    toMarkdown: {
      match: node => node.type.name === 'html',
      runner: (state, node) => {
        state.addNode('html', undefined, node.textContent)
      },
    },
  }
})
