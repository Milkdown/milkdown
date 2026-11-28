import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'

import { isBulletMarker, isOrderedDelimiter, withMeta } from '../__internal__'

type ListNode = Node & {
  ordered?: boolean | null
  children: Node[]
  marker?: string
  delimiter?: string
}

// The number of an ordered list item has at most nine digits.
const ORDERED_ITEM_START = /^\d{1,9}(.)/

/// This plugin keeps the `_` and `*` marker of an emphasis node and a
/// strong node. It also keeps the marker of a list: `-`, `*` or `+` for a
/// bullet list, and the `.` or `)` after the number for an ordered list.
export const remarkMarker = $remark(
  'remarkMarker',
  () => () => (tree, file) => {
    const source = file.value as string
    const getMarker = (node: Node) => {
      return source.charAt(node.position!.start.offset!)
    }
    visit(
      tree,
      (node: Node) => ['strong', 'emphasis'].includes(node.type),
      (node: Node) => {
        ;(node as Node & { marker: string }).marker = getMarker(node)
      }
    )
    visit(tree, 'list', (node: ListNode) => {
      // A list starts with the marker of its first item. A list item that
      // a plugin made has no position, and such a list has no marker.
      const offset = node.children[0]?.position?.start.offset
      if (offset == null) return

      if (node.ordered) {
        const start = source.slice(offset, offset + 10)
        const delimiter = ORDERED_ITEM_START.exec(start)?.[1]
        if (isOrderedDelimiter(delimiter)) node.delimiter = delimiter
      } else {
        const marker = source.charAt(offset)
        if (isBulletMarker(marker)) node.marker = marker
      }
    })
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
