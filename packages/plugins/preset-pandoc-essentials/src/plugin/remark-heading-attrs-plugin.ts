import type { Heading, Root, Text } from 'mdast'
import type { Plugin } from 'unified'

import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'

import { withMeta } from '../__internal__'

interface HeadingData {
  hProperties?: {
    id?: string
    className?: string[]
    [key: string]: unknown
  }
}

/// A remark plugin to parse Pandoc-style heading attributes: # Heading {#id .class key=value}
/// This extracts attributes from the heading text and stores them in node.data.hProperties.
const remarkHeadingAttrs: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'heading', (node: Heading) => {
      const lastChild = node.children[node.children.length - 1]
      if (!lastChild || lastChild.type !== 'text') return

      const text = (lastChild as Text).value
      // Match {#id .class .class2 key=value key2="value with spaces"} at the end
      const attrRegex = /\s*\{([^}]+)\}\s*$/
      const match = text.match(attrRegex)

      if (!match) return

      const attrString = match[1]
      const hProperties: NonNullable<HeadingData['hProperties']> = {}
      const classes: string[] = []

      // Parse the attribute string
      // Matches: #id, .class, key=value, key="value with spaces"
      const tokenRegex =
        /#([\w-]+)|\.([^\s.#=]+)|(\w+)=("[^"]*"|'[^']*'|[^\s]+)/g
      let tokenMatch

      while ((tokenMatch = tokenRegex.exec(attrString)) !== null) {
        if (tokenMatch[1]) {
          // #id
          hProperties.id = tokenMatch[1]
        } else if (tokenMatch[2]) {
          // .class
          classes.push(tokenMatch[2])
        } else if (tokenMatch[3] && tokenMatch[4]) {
          // key=value
          let value = tokenMatch[4]
          // Remove quotes if present
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1)
          }
          hProperties[tokenMatch[3]] = value
        }
      }

      if (classes.length > 0) {
        hProperties.className = classes
      }

      // Only modify if we found attributes
      if (Object.keys(hProperties).length > 0) {
        // Remove the attribute string from the text
        ;(lastChild as Text).value = text.replace(attrRegex, '')

        // If the text is now empty, remove the text node
        if ((lastChild as Text).value === '') {
          node.children.pop()
        }

        // Store attributes in node.data.hProperties
        node.data = node.data || {}
        ;(node.data as HeadingData).hProperties = hProperties
      }
    })
  }
}

export const remarkHeadingAttrsPlugin = $remark(
  'remarkHeadingAttrs',
  () => remarkHeadingAttrs
)

withMeta(remarkHeadingAttrsPlugin.plugin, {
  displayName: 'Remark<remarkHeadingAttrs>',
  group: 'Remark',
})

withMeta(remarkHeadingAttrsPlugin.options, {
  displayName: 'RemarkConfig<remarkHeadingAttrs>',
  group: 'Remark',
})
