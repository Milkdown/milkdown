import type { Node } from '@milkdown/kit/transformer'

import { $remark } from '@milkdown/kit/utils'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'

export const remarkMathPlugin = $remark<'remarkMath', undefined>(
  'remarkMath',
  () => remarkMath
)

function visitMathBlock(ast: Node) {
  return visit(
    ast,
    'math',
    (
      node: Node & { value: string },
      index: number,
      parent: Node & { children: Node[] }
    ) => {
      const { value } = node as Node & { value: string }
      const newNode = {
        type: 'code',
        lang: 'LaTeX',
        value,
      }
      parent.children.splice(index, 1, newNode)
    }
  )
}

/// Turn math block into code block with language LaTeX.
export const remarkMathBlockPlugin = $remark(
  'remarkMathBlock',
  () => () => visitMathBlock
)
