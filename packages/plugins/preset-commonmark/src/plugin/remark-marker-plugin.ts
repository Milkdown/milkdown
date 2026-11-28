import type { Node } from '@milkdown/transformer'
import type { Handle } from 'mdast-util-to-markdown'

import { $remark } from '@milkdown/utils'
import { defaultHandlers } from 'mdast-util-to-markdown'
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

// Write a list with the marker it has: `marker` for a bullet list and
// `delimiter` for an ordered list. The handler of remark takes both from
// the options, so set them for the time it runs. A list inside this one
// that has no marker of its own gets the same marker.
const listHandler: Handle = (node, parent, state, info) => {
  const { bullet, bulletOther, bulletOrdered } = state.options
  const { marker, delimiter } = node as {
    marker?: unknown
    delimiter?: unknown
  }

  if (!node.ordered && isBulletMarker(marker)) {
    state.options.bullet = marker
    // Remark takes `bulletOther` for a list that comes right after another
    // list, and wants it to differ from `bullet`. Without the option it
    // picks one that does.
    if (bulletOther === marker) state.options.bulletOther = undefined
  }
  if (node.ordered && isOrderedDelimiter(delimiter))
    state.options.bulletOrdered = delimiter

  try {
    return defaultHandlers.list(node, parent, state, info)
  } finally {
    state.options.bullet = bullet
    state.options.bulletOther = bulletOther
    state.options.bulletOrdered = bulletOrdered
  }
}

/// This plugin keeps the `_` and `*` marker of an emphasis node and a
/// strong node. It also keeps the marker of a list: `-`, `*` or `+` for a
/// bullet list, and the `.` or `)` after the number for an ordered list.
///
/// It reads the markers from the markdown text, and it makes the
/// serializer write a list with the marker that the list has. The handler
/// for lists is an extension, so a list handler from another remark plugin
/// or from `remarkStringifyOptionsCtx` takes over.
export const remarkMarker = $remark(
  'remarkMarker',
  () =>
    function () {
      const data = this.data() as { toMarkdownExtensions?: unknown[] }
      data.toMarkdownExtensions ??= []
      data.toMarkdownExtensions.push({ handlers: { list: listHandler } })

      return (tree, file) => {
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
          // A list starts with the marker of its first item. A list item
          // that a plugin made has no position, and such a list has no
          // marker.
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
