import type { Link, Root, Text } from 'mdast'
import type { Plugin } from 'unified'

import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'

import { withMeta } from '../__internal__'

interface TextSpanNode {
  type: 'textSpan'
  children: Array<{ type: 'text'; value: string }>
  data: {
    hProperties: {
      id?: string
      className?: string[]
      [key: string]: unknown
    }
  }
}

declare module 'mdast' {
  interface PhrasingContentMap {
    textSpan: TextSpanNode
  }
}

/// A remark plugin to parse Pandoc-style bracketed span syntax: [text]{#id .class key=value}
/// This transforms [text]{.smallcaps} into textSpan nodes in the MDAST.
///
/// Supported syntax:
/// - [text]{.class} - span with class
/// - [text]{#id} - span with id
/// - [text]{#id .class1 .class2} - span with id and multiple classes
/// - [text]{key=value} - span with custom attribute
/// - [text]{.smallcaps} - small caps (common use case)
const remarkSpan: Plugin<[], Root> = () => {
  return (tree) => {
    // First pass: find text nodes that contain the pattern and transform them
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const value = node.value
      // Match [text]{attrs} pattern - but not if preceded by ] (which would be a link)
      // This regex is careful to not match markdown links [text](url)
      const spanRegex = /\[([^\]]+)\]\{([^}]+)\}/g
      const parts: Array<Text | TextSpanNode> = []
      let lastIndex = 0
      let match

      while ((match = spanRegex.exec(value)) !== null) {
        const text = match[1]
        const attrString = match[2]

        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          })
        }

        // Parse attributes
        const hProperties = parseAttributes(attrString)

        // Add the span node
        parts.push({
          type: 'textSpan',
          children: [{ type: 'text', value: text }],
          data: { hProperties },
        })

        lastIndex = match.index + match[0].length
      }

      // Add remaining text after the last match
      if (lastIndex < value.length) {
        parts.push({
          type: 'text',
          value: value.slice(lastIndex),
        })
      }

      // If we found matches, replace the node with the parts
      if (parts.length > 1 || (parts.length === 1 && parts[0].type === 'textSpan')) {
        parent.children.splice(index, 1, ...parts)
        return index + parts.length
      }
    })

    // Second pass: handle links that are followed by {attrs}
    // This catches cases like [text](url){.class} which remark parses as link + text
    visit(tree, 'link', (node: Link, index, parent) => {
      if (!parent || typeof index !== 'number') return

      // Check if the next sibling is a text node starting with {
      const nextSibling = parent.children[index + 1]
      if (!nextSibling || nextSibling.type !== 'text') return

      const textNode = nextSibling as Text
      const attrMatch = textNode.value.match(/^\{([^}]+)\}/)
      if (!attrMatch) return

      // This is a link with attributes - we need to handle this differently
      // For now, we'll convert the link text to a span if the URL is empty or '#'
      if (node.url === '' || node.url === '#') {
        const hProperties = parseAttributes(attrMatch[1])
        const spanText = node.children
          .filter((c): c is Text => c.type === 'text')
          .map((c) => c.value)
          .join('')

        const spanNode: TextSpanNode = {
          type: 'textSpan',
          children: [{ type: 'text', value: spanText }],
          data: { hProperties },
        }

        // Remove the attribute text from the next node
        textNode.value = textNode.value.slice(attrMatch[0].length)

        // Replace the link with the span
        parent.children.splice(index, 1, spanNode)

        // If the text node is now empty, remove it
        if (textNode.value === '') {
          parent.children.splice(index + 1, 1)
        }

        return index + 1
      }
    })
  }
}

function parseAttributes(attrString: string): TextSpanNode['data']['hProperties'] {
  const hProperties: TextSpanNode['data']['hProperties'] = {}
  const classes: string[] = []

  // Parse the attribute string
  // Matches: #id, .class, key=value, key="value with spaces"
  const tokenRegex = /#([\w-]+)|\.([^\s.#=]+)|(\w[\w-]*)=("[^"]*"|'[^']*'|[^\s]+)/g
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

  return hProperties
}

export const remarkSpanPlugin = $remark('remarkSpan', () => remarkSpan)

withMeta(remarkSpanPlugin.plugin, {
  displayName: 'Remark<remarkSpan>',
  group: 'Remark',
})

withMeta(remarkSpanPlugin.options, {
  displayName: 'RemarkConfig<remarkSpan>',
  group: 'Remark',
})
