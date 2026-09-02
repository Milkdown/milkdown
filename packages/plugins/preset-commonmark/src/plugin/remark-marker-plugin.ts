import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'

import { withMeta } from '../__internal__'

/// This plugin keeps the `_` and `*` marker of an emphasis node and a
/// strong node.
export const remarkMarker = $remark(
  'remarkMarker',
  () => () => (tree, file) => {
    const getMarker = (node: Node) => {
      return (file.value as string).charAt(node.position!.start.offset!)
    }
    visit(
      tree,
      (node: Node) => ['strong', 'emphasis'].includes(node.type),
      (node: Node) => {
        ;(node as Node & { marker: string }).marker = getMarker(node)
      }
    )
  }
)

withMeta(remarkMarker.plugin, {
  displayName: 'Remark<remarkMarker>',
  group: 'Remark',
})

withMeta(remarkMarker.options, {
  displayName: 'RemarkConfig<remarkMarker>',
  group: 'Remark',
})
