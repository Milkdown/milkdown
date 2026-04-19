import { expectDomTypeError } from '@milkdown/exception'
import { $nodeSchema } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'

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
      caption: { default: '', validate: 'string' },
      ratio: { default: 1, validate: 'number' },
      alt: { default: '', validate: 'string' },
    },
    parseDOM: [
      {
        tag: `img[data-type="${IMAGE_DATA_TYPE}"]`,
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

          return {
            src: dom.getAttribute('src') || '',
            caption: dom.getAttribute('caption') || '',
            ratio: Number(dom.getAttribute('ratio') ?? 1),
            alt: dom.getAttribute('alt') || '',
          }
        },
      },
    ],
    toDOM: (node) => ['img', { 'data-type': IMAGE_DATA_TYPE, ...node.attrs }],
    parseMarkdown: {
      match: ({ type }) => type === 'image-block',
      runner: (state, node, type) => {
        const src = node.url as string
        const caption = node.title as string
        const rawAlt = (node.alt as string) || ''

        // Parse ratio from alt-text for backward compatibility
        let ratio = Number(rawAlt || 1)
        if (Number.isNaN(ratio) || ratio === 0) ratio = 1

        state.addNode(type, {
          src,
          caption,
          ratio,
          alt: rawAlt,
        })
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'image-block',
      runner: (state, node) => {
        const alt = node.attrs.alt as string
        const ratio = node.attrs.ratio as number

        // Preserve real alt-text if it exists and is non-numeric.
        // If alt-text is numeric or empty, fall back to ratio (backward compatible).
        const isNumericAlt = alt !== '' && !Number.isNaN(Number(alt))
        const altText =
          alt !== '' && !isNumericAlt
            ? alt
            : `${Number.parseFloat(String(ratio)).toFixed(2)}`

        state.openNode('paragraph')
        state.addNode('image', undefined, undefined, {
          title: node.attrs.caption,
          url: node.attrs.src,
          alt: altText,
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
