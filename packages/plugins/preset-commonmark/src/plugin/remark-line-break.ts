import { $remark } from '@milkdown/utils'
import type { Node } from '@milkdown/transformer'
import { visit } from 'unist-util-visit'
import { withMeta } from '../__internal__'

/// This plugin is used to add inline line break for remark AST.
/// The inline line break should be treated as a `space`.
/// And the normal line break should be treated as a `LF`.
export const remarkLineBreak = $remark(
  'remarkLineBreak',
  () => () => (tree: Node) => {
    const find = /[\t ]*(?:\r?\n|\r)/g
    visit(
      tree,
      'text',
      (
        node: Node & { value: string },
        index: number,
        parent: Node & { children: Node[] }
      ) => {
        if (!node.value || typeof node.value !== 'string') return

        const result = []
        let start = 0

        find.lastIndex = 0

        let match = find.exec(node.value)

        while (match) {
          const position = match.index

          if (start !== position)
            result.push({
              type: 'text',
              value: node.value.slice(start, position),
            })

          result.push({ type: 'break', data: { isInline: true } })
          start = position + match[0].length
          match = find.exec(node.value)
        }

        const hasResultAndIndex =
          result.length > 0 && parent && typeof index === 'number'

        if (!hasResultAndIndex) return

        if (start < node.value.length)
          result.push({ type: 'text', value: node.value.slice(start) })

        parent.children.splice(index, 1, ...result)
        return index + result.length
      }
    )
  }
)

withMeta(remarkLineBreak.plugin, {
  displayName: 'Remark<remarkLineBreak>',
  group: 'Remark',
})

withMeta(remarkLineBreak.options, {
  displayName: 'RemarkConfig<remarkLineBreak>',
  group: 'Remark',
})
