import type { Node } from '@milkdown/transformer'
import { visit } from 'unist-util-visit'

function createMermaidDiv(contents: string) {
  return {
    type: 'diagram',
    value: contents,
  }
}

function visitCodeBlock(ast: Node) {
  return visit(
    ast,
    'code',
    (node, index, parent: Node & { children: Node[] }) => {
      const { lang, value } = node

      // If this codeblock is not mermaid, bail.
      if (lang !== 'mermaid') return node

      const newNode = createMermaidDiv(value)

      if (parent && index != null) parent.children.splice(index, 1, newNode)

      return node
    }
  )
}

export function remarkMermaid() {
  function transformer(tree: Node) {
    visitCodeBlock(tree)
  }

  return transformer
}
