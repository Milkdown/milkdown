import type { Node } from '@milkdown/kit/transformer'

import { $remark } from '@milkdown/kit/utils'
import { visit } from 'unist-util-visit'


function visitMermaidBlock(ast: Node) {
  return visit(
    ast,
    'mermaid',
    (
      node: Node & { value: string },
      index: number,
      parent: Node & { children: Node[] }
    ) => {
      const { value } = node as Node & { value: string }
      const newNode = {
        type: 'code',
        lang: 'mermaid',
        value,
      }
      parent.children.splice(index, 1, newNode)
    }
  )
}

export const remarkMermaidBlockPlugin = $remark(
  'remarkMermaidBlock',
  () => () => visitMermaidBlock
)
