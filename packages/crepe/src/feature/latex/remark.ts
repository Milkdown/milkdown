import type { Ctx } from '@milkdown/kit/ctx'
import type { Node } from '@milkdown/kit/transformer'

import { remarkStringifyOptionsCtx } from '@milkdown/kit/core'
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
        // Keep the place in the markdown text, so the block can be told
        // apart from the text around it.
        position: node.position,
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

/// Write a digit that directly follows inline math as a character reference.
/// The guard reads `$x$2` as text, so math followed by a digit is saved as
/// `$x$&#x32;`. It loads back as the same math and the same digit.
export function inlineMathStringifyConfig(ctx: Ctx) {
  ctx.update(remarkStringifyOptionsCtx, (prev) => {
    const text = prev.handlers?.text
    return {
      ...prev,
      handlers: {
        ...prev.handlers,
        text: (node, parent, state, info) => {
          const value = text
            ? text(node, parent, state, info)
            : state.safe(node.value, info)
          if (!/^\d/.test(value)) return value

          const siblings = parent?.children ?? []
          const before = siblings[siblings.indexOf(node) - 1]
          if (before?.type !== 'inlineMath') return value

          const reference = `&#x${value.charCodeAt(0).toString(16)};`
          return reference + value.slice(1)
        },
      },
    }
  })
}
