import { $remark } from '@milkdown/utils'
import type { Node } from '@milkdown/transformer'
import { visit } from 'unist-util-visit'
import { withMeta } from '../__internal__'

/// This plugin is used to keep the marker (`_` and `*`) of emphasis and strong nodes.
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
