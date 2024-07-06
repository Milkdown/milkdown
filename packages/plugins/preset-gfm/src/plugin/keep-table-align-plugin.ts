import type { Transaction } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { Node } from '@milkdown/prose/model'
import { $prose } from '@milkdown/utils'
import { withMeta } from '../__internal__'

const pluginKey = new PluginKey('MILKDOWN_KEEP_TABLE_ALIGN_PLUGIN')

function getChildIndex(node: Node, parent: Node) {
  let index = 0
  parent.forEach((child, _offset, i) => {
    if (child === node)
      index = i
  })
  return index
}

export const keepTableAlignPlugin = $prose(() => {
  return new Plugin({
    key: pluginKey,
    appendTransaction: (_tr, oldState, state) => {
      let tr: Transaction | undefined
      const check = (node: Node, pos: number) => {
        if (!tr)
          tr = state.tr

        if (node.type.name !== 'table_cell')
          return

        const $pos = state.doc.resolve(pos)
        const tableRow = $pos.node($pos.depth)
        const table = $pos.node($pos.depth - 1)
        const tableHeaderRow = table.firstChild
        // TODO: maybe consider add a header row
        if (!tableHeaderRow)
          return

        const index = getChildIndex(node, tableRow)
        const headerCell = tableHeaderRow.maybeChild(index)
        if (!headerCell)
          return
        const align = headerCell.attrs.alignment
        const currentAlign = node.attrs.alignment
        if (align === currentAlign)
          return

        tr.setNodeMarkup(pos, undefined, { ...node.attrs, alignment: align })
      }
      if (oldState.doc !== state.doc)
        state.doc.descendants(check)

      return tr
    },
  })
})

withMeta(keepTableAlignPlugin, {
  displayName: 'Prose<keepTableAlignPlugin>',
  group: 'Prose',
})
