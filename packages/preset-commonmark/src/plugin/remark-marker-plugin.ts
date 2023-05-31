/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import type { Node } from 'unist'
import type { VFile } from 'vfile'
import { visit } from 'unist-util-visit'
import { withMeta } from '../__internal__'

export const remarkMarker = $remark(() => () => (tree: Node, file: VFile) => {
  const getMarker = (node: Node) => {
    return (file.value as string).charAt(node.position!.start.offset!)
  }
  visit(tree, node => ['strong', 'emphasis'].includes(node.type), (node: Node) => {
    (node as Node & { marker: string }).marker = getMarker(node)
  })
})

withMeta(remarkMarker, {
  displayName: 'Remark<remarkMarker>',
  group: 'Remark',
})
