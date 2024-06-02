import { expectDomTypeError } from '@milkdown/exception'
import { $nodeSchema } from '@milkdown/utils'
import { withMeta } from '../../__internal__'

const id = 'footnote_definition'
const markdownId = 'footnoteDefinition'

/// Footnote definition node schema.
export const footnoteDefinitionSchema = $nodeSchema('footnote_definition', () => ({
  group: 'block',
  content: 'block+',
  defining: true,
  attrs: {
    label: {
      default: '',
    },
  },
  parseDOM: [
    {
      tag: `dl[data-type="${id}"]`,
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement))
          throw expectDomTypeError(dom)

        return {
          label: dom.dataset.label,
        }
      },
      contentElement: 'dd',
    },
  ],
  toDOM: (node) => {
    const label = node.attrs.label

    return [
      'dl',
      {
        // TODO: add a prosemirror plugin to sync label on change
        'data-label': label,
        'data-type': id,
      },
      ['dt', label],
      ['dd', 0],
    ]
  },
  parseMarkdown: {
    match: ({ type }) => type === markdownId,
    runner: (state, node, type) => {
      state
        .openNode(type, {
          label: node.label as string,
        })
        .next(node.children)
        .closeNode()
    },
  },
  toMarkdown: {
    match: node => node.type.name === id,
    runner: (state, node) => {
      state
        .openNode(markdownId, undefined, {
          label: node.attrs.label,
          identifier: node.attrs.label,
        })
        .next(node.content)
        .closeNode()
    },
  },
}))

withMeta(footnoteDefinitionSchema.ctx, {
  displayName: 'NodeSchemaCtx<footnodeDef>',
  group: 'footnote',
})

withMeta(footnoteDefinitionSchema.node, {
  displayName: 'NodeSchema<footnodeDef>',
  group: 'footnote',
})
