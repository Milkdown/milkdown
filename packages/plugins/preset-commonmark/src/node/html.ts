import { $nodeAttr, $nodeSchema } from '@milkdown/utils'
import { withMeta } from '../__internal__'

export const htmlAttr = $nodeAttr('html')

withMeta(htmlAttr, {
  displayName: 'Attr<html>',
  group: 'Html',
})

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
    parseDOM: [
      {
        tag: 'span[data-type="html"]',
        getAttrs: (dom) => {
          return {
            value: dom.dataset.value ?? '',
          }
        },
      },
    ],
    parseMarkdown: {
      match: ({ type }) => Boolean(type === 'html'),
      runner: (state, node, type) => {
        state.addNode(type, { value: node.value as string })
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'html',
      runner: (state, node) => {
        state.addNode('html', undefined, node.attrs.value)
      },
    },
  }
})

withMeta(htmlSchema.node, {
  displayName: 'NodeSchema<html>',
  group: 'Html',
})

withMeta(htmlSchema.ctx, {
  displayName: 'NodeSchemaCtx<html>',
  group: 'Html',
})
