import type { Root, Text } from 'mdast'
import type { Plugin } from 'unified'

import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'

import { withMeta } from '../__internal__'

interface SuperscriptNode {
  type: 'superscript'
  children: Array<{ type: 'text'; value: string }>
}

declare module 'mdast' {
  interface PhrasingContentMap {
    superscript: SuperscriptNode
  }
}

/// A remark plugin to parse Pandoc-style superscript syntax: ^text^
/// This transforms ^text^ into superscript nodes in the MDAST.
const remarkSuperscript: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const value = node.value
      const superscriptRegex = /\^([^^]+)\^/g
      const parts: Array<Text | SuperscriptNode> = []
      let lastIndex = 0
      let match

      while ((match = superscriptRegex.exec(value)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          })
        }

        // Add the superscript node
        parts.push({
          type: 'superscript',
          children: [{ type: 'text', value: match[1] }],
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
      if (parts.length > 0 && parts.length !== 1) {
        parent.children.splice(index, 1, ...parts)
        return index + parts.length
      }
    })
  }
}

export const remarkSuperscriptPlugin = $remark(
  'remarkSuperscript',
  () => remarkSuperscript
)

withMeta(remarkSuperscriptPlugin.plugin, {
  displayName: 'Remark<remarkSuperscript>',
  group: 'Remark',
})

withMeta(remarkSuperscriptPlugin.options, {
  displayName: 'RemarkConfig<remarkSuperscript>',
  group: 'Remark',
})
