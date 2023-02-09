/* Copyright 2021, Milkdown by Mirone. */

import { expectDomTypeError } from '@milkdown/exception'
import { $nodeSchema } from '@milkdown/utils'

const id = 'footnote_reference'

/// Footnote reference node schema.
export const footnoteReferenceSchema = $nodeSchema('footnote_reference', () => ({
  group: 'inline',
  inline: true,
  atom: true,
  attrs: {
    label: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: `sup[data-type="${id}"]`,
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return {
          label: dom.dataset.label,
        }
      },
    },
  ],
  toDOM: (node) => {
    const label = node.attrs.label
    return [
      'sup',
      {
        // TODO: add a prosemirror plugin to sync label on change
        'data-label': label,
        'data-type': id,
      },
      label,
    ]
  },
  parseMarkdown: {
    match: ({ type }) => type === 'footnoteReference',
    runner: (state, node, type) => {
      state.addNode(type, {
        label: node.label as string,
      })
    },
  },
  toMarkdown: {
    match: node => node.type.name === id,
    runner: (state, node) => {
      state.addNode('footnoteReference', undefined, undefined, {
        label: node.attrs.label,
        identifier: node.attrs.label,
      })
    },
  },
}))
