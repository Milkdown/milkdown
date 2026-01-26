import { expectDomTypeError } from '@milkdown/exception'
import { $nodeAttr, $nodeSchema } from '@milkdown/utils'

import { withMeta } from '../__internal__'

/// HTML attributes for the div node.
export const divAttr = $nodeAttr('div')

withMeta(divAttr, {
  displayName: 'Attr<div>',
  group: 'Div',
})

/// Div node schema.
/// Pandoc syntax:
/// ::: {#id .class key=value}
/// content
/// :::
/// This enables fenced divs for custom containers, warnings, notes, etc.
export const divSchema = $nodeSchema('div', (ctx) => ({
  content: 'block+',
  group: 'block',
  defining: true,
  attrs: {
    id: { default: null },
    class: { default: null },
    name: { default: null },
  },
  parseDOM: [
    {
      tag: 'div[data-type="directive-div"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)
        return {
          id: dom.id || null,
          class: dom.dataset.class || null,
          name: dom.dataset.name || null,
        }
      },
    },
  ],
  toDOM: (node) => {
    const attrs: Record<string, string> = {
      'data-type': 'directive-div',
      ...ctx.get(divAttr.key)(node),
    }
    if (node.attrs.id) attrs.id = node.attrs.id
    if (node.attrs.class) {
      attrs.class = node.attrs.class
      attrs['data-class'] = node.attrs.class
    }
    if (node.attrs.name) attrs['data-name'] = node.attrs.name

    return ['div', attrs, 0]
  },
  parseMarkdown: {
    match: (node) => node.type === 'containerDirective',
    runner: (state, node, type) => {
      const attrs = node.attributes as Record<string, string> | undefined
      const id = attrs?.id || null
      const className = attrs?.class || null
      const name = (node.name as string) || null

      state.openNode(type, { id, class: className, name })
      state.next(node.children)
      state.closeNode()
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'div',
    runner: (state, node) => {
      const attrs: Record<string, string> = {}
      if (node.attrs.id) attrs.id = node.attrs.id
      if (node.attrs.class) attrs.class = node.attrs.class

      state.openNode('containerDirective', undefined, {
        name: node.attrs.name || 'div',
        attributes: Object.keys(attrs).length > 0 ? attrs : undefined,
      })
      state.next(node.content)
      state.closeNode()
    },
  },
}))

withMeta(divSchema.node, {
  displayName: 'NodeSchema<div>',
  group: 'Div',
})

withMeta(divSchema.ctx, {
  displayName: 'NodeSchemaCtx<div>',
  group: 'Div',
})
