import { expectDomTypeError } from '@milkdown/exception'
import { $markAttr, $markSchema } from '@milkdown/utils'

import { withMeta } from '../__internal__'

/// HTML attributes for the text span mark.
export const textSpanAttr = $markAttr('text_span')

withMeta(textSpanAttr, {
  displayName: 'Attr<textSpan>',
  group: 'TextSpan',
})

/// Text span mark schema.
/// Pandoc syntax: [text]{#id .class key=value}
/// This enables inline styling, small caps via .smallcaps, and other custom formatting.
export const textSpanSchema = $markSchema('text_span', (ctx) => ({
  attrs: {
    id: { default: null },
    class: { default: null },
    style: { default: null },
  },
  parseDOM: [
    {
      tag: 'span[data-type="text-span"]',
      getAttrs: (dom) => {
        if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)
        return {
          id: dom.id || null,
          class: dom.className || null,
          style: dom.style.cssText || null,
        }
      },
    },
  ],
  toDOM: (mark) => {
    const attrs: Record<string, string> = {
      'data-type': 'text-span',
      ...ctx.get(textSpanAttr.key)(mark),
    }
    if (mark.attrs.id) attrs.id = mark.attrs.id
    if (mark.attrs.class) attrs.class = mark.attrs.class
    if (mark.attrs.style) attrs.style = mark.attrs.style

    return ['span', attrs]
  },
  parseMarkdown: {
    match: (node) => node.type === 'textDirective' && node.name === 'span',
    runner: (state, node, markType) => {
      const attrs = node.attributes as Record<string, string> | undefined
      const id = attrs?.id || null
      const className = attrs?.class || null
      const style = attrs?.style || null

      state.openMark(markType, { id, class: className, style })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'text_span',
    runner: (state, mark) => {
      const attrs: Record<string, string> = {}
      if (mark.attrs.id) attrs.id = mark.attrs.id
      if (mark.attrs.class) attrs.class = mark.attrs.class
      if (mark.attrs.style) attrs.style = mark.attrs.style

      state.withMark(mark, 'textDirective', undefined, {
        name: 'span',
        attributes: attrs,
      })
    },
  },
}))

withMeta(textSpanSchema.mark, {
  displayName: 'MarkSchema<textSpan>',
  group: 'TextSpan',
})

withMeta(textSpanSchema.ctx, {
  displayName: 'MarkSchemaCtx<textSpan>',
  group: 'TextSpan',
})
