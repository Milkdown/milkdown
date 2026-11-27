import { expectDomTypeError } from '@milkdown/exception'
import { $nodeSchema } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'
import { parseImageBlockAlt, serializeImageBlockAlt } from './alt'

export const IMAGE_DATA_TYPE = 'image-block'

export const imageBlockSchema = $nodeSchema('image-block', () => {
  return {
    inline: false,
    group: 'block',
    selectable: true,
    draggable: true,
    isolating: true,
    marks: '',
    atom: true,
    priority: 100,
    attrs: {
      src: { default: '', validate: 'string' },
      alt: { default: null, validate: 'string|null' },
      caption: { default: '', validate: 'string' },
      ratio: { default: 1, validate: 'number' },
    },
    parseDOM: [
      {
        tag: `img[data-type="${IMAGE_DATA_TYPE}"]`,
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

          return {
            src: dom.getAttribute('src') || '',
            alt: dom.getAttribute('alt'),
            caption: dom.getAttribute('caption') || '',
            ratio: Number(dom.getAttribute('ratio') ?? 1),
          }
        },
      },
    ],
    toDOM: (node) => ['img', { 'data-type': IMAGE_DATA_TYPE, ...node.attrs }],
    parseMarkdown: {
      match: ({ type }) => type === 'image-block',
      runner: (state, node, type) => {
        const src = node.url as string
        // mdast gives null for a title that the markdown omits, and caption is
        // a validated string attribute.
        const caption = (node.title as string | null) ?? ''
        const { alt, ratio } = parseImageBlockAlt(
          (node.alt as string | null) ?? ''
        )

        state.addNode(type, {
          src,
          alt,
          caption,
          ratio,
        })
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'image-block',
      runner: (state, node) => {
        state.openNode('paragraph')
        state.addNode('image', undefined, undefined, {
          title: node.attrs.caption,
          url: node.attrs.src,
          alt: serializeImageBlockAlt({
            alt: node.attrs.alt,
            ratio: Number.parseFloat(node.attrs.ratio),
          }),
        })
        state.closeNode()
      },
    },
  }
})

withMeta(imageBlockSchema.node, {
  displayName: 'NodeSchema<image-block>',
  group: 'ImageBlock',
})
