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
///
/// Supports two input syntaxes:
/// 1. Pandoc native: [text]{.class #id key=value}
/// 2. Directive syntax: :span[text]{.class #id}
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
    match: (node) =>
      // Match Pandoc native syntax: textSpan nodes from remark-span-plugin
      node.type === 'textSpan' ||
      // Match directive syntax: :span[text]{attrs}
      (node.type === 'textDirective' && node.name === 'span'),
    runner: (state, node, markType) => {
      let id: string | null = null
      let className: string | null = null
      let style: string | null = null

      if (node.type === 'textSpan') {
        // Pandoc native syntax - attributes are in node.data.hProperties
        const hProps = (node.data as { hProperties?: Record<string, unknown> })
          ?.hProperties
        if (hProps) {
          id = (hProps.id as string) || null
          if (Array.isArray(hProps.className)) {
            className = hProps.className.join(' ')
          } else if (typeof hProps.className === 'string') {
            className = hProps.className
          }
          style = (hProps.style as string) || null
        }
      } else {
        // Directive syntax - attributes are in node.attributes
        const attrs = node.attributes as Record<string, string> | undefined
        id = attrs?.id || null
        className = attrs?.class || null
        style = attrs?.style || null
      }

      state.openMark(markType, { id, class: className, style })
      state.next(node.children)
      state.closeMark(markType)
    },
  },
  toMarkdown: {
    match: (mark) => mark.type.name === 'text_span',
    runner: (state, mark) => {
      // Output Pandoc native syntax: [text]{#id .class}
      // We use a custom textSpan node type
      const hProperties: Record<string, unknown> = {}
      if (mark.attrs.id) hProperties.id = mark.attrs.id
      if (mark.attrs.class) hProperties.className = mark.attrs.class
      if (mark.attrs.style) hProperties.style = mark.attrs.style

      state.withMark(mark, 'textSpan', undefined, {
        data: { hProperties },
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
