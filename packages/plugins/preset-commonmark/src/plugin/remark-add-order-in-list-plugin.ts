import { $remark } from '@milkdown/utils'
import { visit } from 'unist-util-visit'
import { withMeta } from '../__internal__'

/// This plugin is used to add order in list for remark AST.
export const remarkAddOrderInListPlugin = $remark(
  'remarkAddOrderInList',
  () => () => (tree) => {
    visit(tree, 'list', (node) => {
      if (node.ordered) {
        const start = node.start ?? 1
        node.children.forEach((child, index) => {
          ;(child as unknown as Record<string, number>).label = index + start
        })
      }
    })
  }
)

withMeta(remarkAddOrderInListPlugin.plugin, {
  displayName: 'Remark<remarkAddOrderInListPlugin>',
  group: 'Remark',
})

withMeta(remarkAddOrderInListPlugin.options, {
  displayName: 'RemarkConfig<remarkAddOrderInListPlugin>',
  group: 'Remark',
})
