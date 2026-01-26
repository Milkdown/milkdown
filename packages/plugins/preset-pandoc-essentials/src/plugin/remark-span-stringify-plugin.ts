import type { Root } from 'mdast'
import type { Plugin } from 'unified'

import { $remark } from '@milkdown/utils'

import { withMeta } from '../__internal__'

interface TextSpanNode {
  type: 'textSpan'
  children: Array<{ type: 'text'; value: string }>
  data?: {
    hProperties?: {
      id?: string
      className?: string | string[]
      style?: string
      [key: string]: unknown
    }
  }
}

/// A remark plugin to serialize textSpan nodes back to Pandoc syntax: [text]{#id .class}
const remarkSpanStringify: Plugin<[], Root> = function () {
  const data = this.data() as {
    toMarkdownExtensions?: Array<{
      handlers?: Record<
        string,
        (node: TextSpanNode, _: unknown, state: { containerPhrasing: (node: TextSpanNode, info: unknown) => string }, info: unknown) => string
      >
    }>
  }

  // Add a handler for textSpan nodes
  data.toMarkdownExtensions = data.toMarkdownExtensions || []
  data.toMarkdownExtensions.push({
    handlers: {
      textSpan: (node, _, state, info) => {
        const hProps = node.data?.hProperties || {}
        const parts: string[] = []

        // Build attribute string
        if (hProps.id) {
          parts.push(`#${hProps.id}`)
        }
        if (hProps.className) {
          const classes = Array.isArray(hProps.className)
            ? hProps.className
            : [hProps.className]
          for (const cls of classes) {
            parts.push(`.${cls}`)
          }
        }
        if (hProps.style) {
          parts.push(`style="${hProps.style}"`)
        }
        // Add other attributes
        for (const [key, value] of Object.entries(hProps)) {
          if (
            key !== 'id' &&
            key !== 'className' &&
            key !== 'style' &&
            typeof value === 'string'
          ) {
            if (value.includes(' ')) {
              parts.push(`${key}="${value}"`)
            } else {
              parts.push(`${key}=${value}`)
            }
          }
        }

        // Get the text content
        const text = state.containerPhrasing(node, info)
        const attrString = parts.length > 0 ? `{${parts.join(' ')}}` : ''

        return `[${text}]${attrString}`
      },
    },
  })

  return (tree) => tree
}

export const remarkSpanStringifyPlugin = $remark(
  'remarkSpanStringify',
  () => remarkSpanStringify
)

withMeta(remarkSpanStringifyPlugin.plugin, {
  displayName: 'Remark<remarkSpanStringify>',
  group: 'Remark',
})

withMeta(remarkSpanStringifyPlugin.options, {
  displayName: 'RemarkConfig<remarkSpanStringify>',
  group: 'Remark',
})
