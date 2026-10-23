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

interface InlineMathNode extends Node {
  value: string
}

// Turn inline math that breaks the pandoc rule back into text:
// the opening `$` must be followed by a non-space, the closing `$` must be
// preceded by a non-space and must not be followed by a digit.
// This keeps prices such as "$5 and $10" from becoming math.
function visitInlineMath(ast: Node, file: { value?: unknown }) {
  const source = typeof file.value === 'string' ? file.value : undefined
  if (!source) return

  visit(
    ast,
    'inlineMath',
    (
      node: InlineMathNode,
      index: number,
      parent: Node & { children: Node[] }
    ) => {
      const start = node.position?.start.offset
      const end = node.position?.end.offset
      if (start == null || end == null || source[start + 1] === '$') return

      const raw = source.slice(start, end)
      const valid =
        !/^\$\s/.test(raw) &&
        !/\s\$$/.test(raw) &&
        !/\d/.test(source[end] ?? '')
      if (valid) return

      parent.children.splice(index, 1, { type: 'text', value: raw } as Node)
    }
  )
}

/// Keep inline math that does not follow the pandoc rule as plain text.
export const remarkInlineMathGuardPlugin = $remark(
  'remarkInlineMathGuard',
  () => () => visitInlineMath
)
