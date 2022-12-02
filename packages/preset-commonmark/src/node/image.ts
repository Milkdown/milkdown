/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError } from '@milkdown/exception'
import { findSelectedNodeOfType } from '@milkdown/prose'
import { InputRule } from '@milkdown/prose/inputrules'
import { $command, $inputRule, $nodeAttr, $nodeSchema } from '@milkdown/utils'

export const imageAttr = $nodeAttr('image')

export const imageSchema = $nodeSchema('image', (ctx) => {
  return {
    inline: true,
    group: 'inline',
    selectable: true,
    draggable: true,
    marks: '',
    atom: true,
    defining: true,
    isolating: true,
    attrs: {
      src: { default: '' },
      alt: { default: '' },
      title: { default: '' },
    },
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement))
            throw expectDomTypeError(dom)

          return {
            src: dom.getAttribute('src') || '',
            alt: dom.getAttribute('alt') || '',
            title: dom.getAttribute('title') || dom.getAttribute('alt') || '',
          }
        },
      },
    ],
    toDOM: (node) => {
      return ['img', { ...ctx.get(imageAttr.key)(node), ...node.attrs }]
    },
    parseMarkdown: {
      match: ({ type }) => type === 'image',
      runner: (state, node, type) => {
        const url = node.url as string
        const alt = node.alt as string
        const title = node.title as string
        state.addNode(type, {
          src: url,
          alt,
          title,
        })
      },
    },
    toMarkdown: {
      match: node => node.type.name === 'image',
      runner: (state, node) => {
        state.addNode('image', undefined, undefined, {
          title: node.attrs.title,
          url: node.attrs.src,
          alt: node.attrs.alt,
        })
      },
    },
  }
})

export type UpdateImageCommandPayload = {
  src?: string
  title?: string
  alt?: string
}
export const insertImageCommand = $command('InsertImage', () => (payload: UpdateImageCommandPayload = {}) =>
  (state, dispatch) => {
    if (!dispatch)
      return true

    const { src = '', alt = '', title = '' } = payload

    const node = imageSchema.type().create({ src, alt, title })
    if (!node)
      return true

    dispatch(state.tr.replaceSelectionWith(node).scrollIntoView())
    return true
  })

export const updateImageCommand = $command('UpdateImage', () => (payload: UpdateImageCommandPayload = {}) => (state, dispatch) => {
  const nodeWithPos = findSelectedNodeOfType(state.selection, imageSchema.type())
  if (!nodeWithPos)
    return false

  const { node, pos } = nodeWithPos

  const newAttrs = { ...node.attrs }
  const { src, alt, title } = payload
  if (src !== undefined)
    newAttrs.src = src
  if (alt !== undefined)
    newAttrs.alt = alt
  if (title !== undefined)
    newAttrs.title = title

  dispatch?.(state.tr.setNodeMarkup(pos, undefined, newAttrs).scrollIntoView())
  return true
})

export const insertImageInputRule = $inputRule(() => new InputRule(
  /!\[(?<alt>.*?)]\((?<filename>.*?)\s*(?="|\))"?(?<title>[^"]+)?"?\)/,
  (state, match, start, end) => {
    const [matched, alt, src = '', title] = match
    if (matched)
      return state.tr.replaceWith(start, end, imageSchema.type().create({ src, alt, title }))

    return null
  },
))

