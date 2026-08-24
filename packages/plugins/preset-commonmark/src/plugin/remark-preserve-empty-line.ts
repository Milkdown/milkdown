import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { visitParents } from 'unist-util-visit-parents'

import { withMeta } from '../__internal__'

// Serializer empty-line placeholders are a lone <br> inside a paragraph
// (or a table cell). A lone <br> under heading/link/emphasis is user HTML
// and must be kept.
const EMPTY_LINE_BR_PARENTS = new Set(['paragraph', 'tableCell'])

function visitEmptyLine(ast: Node) {
  return visitParents(
    ast,
    (node: Node) =>
      node.type === 'html' &&
      ['<br />', '<br>', '<br >', '<br/>'].includes(
        (node as Node & { value: string }).value?.trim()
      ),
    (node: Node, parents: Node[]) => {
      if (!parents.length) return
      const parent = parents[parents.length - 1] as
        | (Node & { children: Node[] })
        | undefined
      if (!parent) return
      if (parent.children.length !== 1 || parent.children[0] !== node) return
      if (!EMPTY_LINE_BR_PARENTS.has(parent.type)) return

      parent.children.splice(0, 1)
    },
    true
  )
}

/// @internal
/// This plugin is used to preserve the empty line.
/// Markdown will fold the empty line into the previous line by default.
/// This plugin will preserve the empty line by converting `<br />` to `line-break`.
/// This plugin should be used with `linebreakSchema` to work.
export const remarkPreserveEmptyLinePlugin = $remark(
  'remark-preserve-empty-line',
  () => () => visitEmptyLine
)

withMeta(remarkPreserveEmptyLinePlugin.plugin, {
  displayName: 'Remark<remarkPreserveEmptyLine>',
  group: 'Remark',
})

withMeta(remarkPreserveEmptyLinePlugin.options, {
  displayName: 'RemarkConfig<remarkPreserveEmptyLine>',
  group: 'Remark',
})
