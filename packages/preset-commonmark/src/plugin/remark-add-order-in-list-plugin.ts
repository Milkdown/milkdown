/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import type { Node, Parent } from 'unist'
import { visit } from 'unist-util-visit'
import { withMeta } from '../__internal__'

/// This plugin is used to add order in list for remark AST.
export const remarkAddOrderInListPlugin = $remark(() => () => (tree: Node) => {
  visit(tree, 'list', (node: Parent & { ordered?: boolean; start?: number }) => {
    if (node.ordered) {
      const start = node.start ?? 1
      node.children.forEach((child, index) => {
        (child as Node & { label: number }).label = index + start
      })
    }
  })
})

withMeta(remarkAddOrderInListPlugin, {
  displayName: 'Remark<remarkAddOrderInListPlugin>',
  group: 'Remark',
})
