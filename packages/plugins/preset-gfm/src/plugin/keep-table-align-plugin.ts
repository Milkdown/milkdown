import type { Node } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

import { withMeta } from '../__internal__'

const pluginKey = new PluginKey('MILKDOWN_KEEP_TABLE_ALIGN_PLUGIN')

function getChildIndex(node: Node, parent: Node) {
  let index = 0
  parent.forEach((child, _offset, i) => {
    if (child === node) index = i
  })
  return index
}

// The span that differs between the two docs, in `next` coordinates, or `null`
// when they are value-identical. Both scans compare children by reference
// before looking inside them.
function changedRange(prev: Node, next: Node) {
  const from = prev.content.findDiffStart(next.content)
  if (from == null) return null

  const diff = prev.content.findDiffEnd(next.content)
  if (!diff) return null

  // Repeated content ("aa" -> "aaa") lets the end scan overrun the start.
  return { from, to: Math.max(diff.b, from) }
}

export const keepTableAlignPlugin = $prose(() => {
  return new Plugin({
    key: pluginKey,
    appendTransaction: (_tr, oldState, state) => {
      if (oldState.doc === state.doc) return

      const range = changedRange(oldState.doc, state.doc)
      if (!range) return

      let tr: Transaction | undefined
      const check = (node: Node, pos: number) => {
        if (node.type.name !== 'table_cell') return

        const $pos = state.doc.resolve(pos)
        const tableRow = $pos.node($pos.depth)
        const table = $pos.node($pos.depth - 1)
        const tableHeaderRow = table.firstChild
        // TODO: maybe consider add a header row
        if (!tableHeaderRow) return

        const index = getChildIndex(node, tableRow)
        const headerCell = tableHeaderRow.maybeChild(index)
        if (!headerCell) return
        const align = headerCell.attrs.alignment
        const currentAlign = node.attrs.alignment
        if (align === currentAlign) return

        // Creating `tr` any earlier appends an empty transaction to every
        // document change.
        if (!tr) tr = state.tr
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, alignment: align })
      }

      // `nodesBetween` reports the range's ancestors, so an edit deep inside a
      // cell still reaches its table. Each table it finds is checked in full,
      // because a header cell reaches body cells outside the range.
      state.doc.nodesBetween(range.from, range.to, (node, pos) => {
        if (node.type.name !== 'table') return true

        state.doc.nodesBetween(pos, pos + node.nodeSize, check)
        // Tables do not nest.
        return false
      })

      return tr
    },
  })
})

withMeta(keepTableAlignPlugin, {
  displayName: 'Prose<keepTableAlignPlugin>',
  group: 'Prose',
})
