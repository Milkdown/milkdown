/* Copyright 2021, Milkdown by Mirone. */
import { $nodeAttr, $nodeSchema } from '@milkdown/utils'

export const htmlAttr = $nodeAttr('html')

export const htmlSchema = $nodeSchema('html', (ctx) => {
  return {
    atom: true,
    group: 'inline',
    inline: true,
    attrs: {
      value: {
        default: '',
      },
    },
    toDOM: (node) => {
      const span = document.createElement('span')
      const attr = {
        ...ctx.get(htmlAttr.key)(node),
        'data-value': node.attrs.value,
        'data-type': 'html',
      }
      span.textContent = node.attrs.value
      return ['span', attr, node.attrs.value]
    },
    parseDOM: [{
      tag: 'span[data-type="html"]',
      getAttrs: (dom) => {
        return {
          value: (dom as HTMLElement).dataset.value ?? '',
        }
      },
    }],
    parseMarkdown: {
      match: ({ type }) => Boolean(type === 'html'),
      runner: (state, node, type) => {
        state.addNode(type, { value: node.value as string })
      },
    },
    toMarkdown: {
      match: node => node.type.name === 'html',
      runner: (state, node) => {
        state.addNode('html', undefined, node.attrs.value)
      },
    },
  }
})
