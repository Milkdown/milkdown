/* Copyright 2021, Milkdown by Mirone. */
import type { Node } from 'unist'
import type { Parent } from 'unist-util-visit'
import { visit } from 'unist-util-visit'

export const addOrderInList = () => {
  function transformer(ast: Node) {
    visit(ast, 'list', (node: Parent & { ordered?: boolean; start?: number }) => {
      if (node.ordered) {
        const start = node.start ?? 1
        node.children.forEach((child, index) => {
          (child as Node & { label: number }).label = index + start
        })
      }
    })
  }

  return transformer
}
