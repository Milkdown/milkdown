import { expectDomTypeError } from '@milkdown/exception'
import { headingSchema } from '@milkdown/preset-commonmark'

import { withMeta } from '../__internal__'

/// This schema extends the heading schema from commonmark to add Pandoc-style attributes.
/// Pandoc syntax: # Heading {#id .class key=value}
export const extendHeadingSchemaForAttrs = headingSchema.extendSchema(
  (prev) => {
    return (ctx) => {
      const baseSchema = prev(ctx)
      return {
        ...baseSchema,
        attrs: {
          ...baseSchema.attrs,
          class: {
            default: null,
          },
          // Additional attributes stored as JSON
          dataAttrs: {
            default: null,
          },
        },
        parseDOM: [
          {
            tag: 'h1',
            getAttrs: (dom) => getAttrsFromDom(dom, 1),
          },
          {
            tag: 'h2',
            getAttrs: (dom) => getAttrsFromDom(dom, 2),
          },
          {
            tag: 'h3',
            getAttrs: (dom) => getAttrsFromDom(dom, 3),
          },
          {
            tag: 'h4',
            getAttrs: (dom) => getAttrsFromDom(dom, 4),
          },
          {
            tag: 'h5',
            getAttrs: (dom) => getAttrsFromDom(dom, 5),
          },
          {
            tag: 'h6',
            getAttrs: (dom) => getAttrsFromDom(dom, 6),
          },
        ],
        toDOM: (node) => {
          const attrs: Record<string, string> = {}
          if (node.attrs.id) attrs.id = node.attrs.id
          if (node.attrs.class) attrs.class = node.attrs.class

          // Add data attributes
          if (node.attrs.dataAttrs) {
            try {
              const dataAttrs = JSON.parse(node.attrs.dataAttrs) as Record<
                string,
                string
              >
              for (const [key, value] of Object.entries(dataAttrs)) {
                attrs[`data-${key}`] = value
              }
            } catch {
              // Ignore invalid JSON
            }
          }

          return [`h${node.attrs.level}`, attrs, 0]
        },
        parseMarkdown: {
          match: ({ type }) => type === 'heading',
          runner: (state, node, type) => {
            const depth = node.depth as number
            const data = node.data as
              | { hProperties?: Record<string, unknown> }
              | undefined
            const hProperties = data?.hProperties

            let id = state.get(ctx)?.get(headingSchema.node)?.attrs?.id || ''
            let className: string | null = null
            let dataAttrs: string | null = null

            if (hProperties) {
              if (typeof hProperties.id === 'string') {
                id = hProperties.id
              }
              if (typeof hProperties.className === 'string') {
                className = hProperties.className
              } else if (Array.isArray(hProperties.className)) {
                className = hProperties.className.join(' ')
              }

              // Extract other attributes
              const otherAttrs: Record<string, string> = {}
              for (const [key, value] of Object.entries(hProperties)) {
                if (key !== 'id' && key !== 'className' && typeof value === 'string') {
                  otherAttrs[key] = value
                }
              }
              if (Object.keys(otherAttrs).length > 0) {
                dataAttrs = JSON.stringify(otherAttrs)
              }
            }

            state.openNode(type, { level: depth, id, class: className, dataAttrs })
            state.next(node.children)
            state.closeNode()
          },
        },
        toMarkdown: {
          match: (node) => node.type.name === 'heading',
          runner: (state, node) => {
            const hProperties: Record<string, unknown> = {}
            if (node.attrs.id) hProperties.id = node.attrs.id
            if (node.attrs.class) hProperties.className = node.attrs.class

            // Add data attributes
            if (node.attrs.dataAttrs) {
              try {
                const dataAttrs = JSON.parse(node.attrs.dataAttrs) as Record<
                  string,
                  string
                >
                Object.assign(hProperties, dataAttrs)
              } catch {
                // Ignore invalid JSON
              }
            }

            const data =
              Object.keys(hProperties).length > 0 ? { hProperties } : undefined

            state.openNode('heading', undefined, {
              depth: node.attrs.level,
              data,
            })
            state.next(node.content)
            state.closeNode()
          },
        },
      }
    }
  }
)

function getAttrsFromDom(dom: Node | string, level: number) {
  if (!(dom instanceof HTMLElement)) throw expectDomTypeError(dom)

  const dataAttrs: Record<string, string> = {}
  for (const attr of dom.attributes) {
    if (attr.name.startsWith('data-')) {
      dataAttrs[attr.name.slice(5)] = attr.value
    }
  }

  return {
    level,
    id: dom.id || null,
    class: dom.className || null,
    dataAttrs: Object.keys(dataAttrs).length > 0 ? JSON.stringify(dataAttrs) : null,
  }
}

withMeta(extendHeadingSchemaForAttrs.node, {
  displayName: 'NodeSchema<headingWithAttrs>',
  group: 'Heading',
})

withMeta(extendHeadingSchemaForAttrs.ctx, {
  displayName: 'NodeSchemaCtx<headingWithAttrs>',
  group: 'Heading',
})
