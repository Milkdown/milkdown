/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import type { Literal, Node } from 'unist'
import { visit } from 'unist-util-visit'

export const remarkIframePlugin = $remark(() => () => {
  function transformer(tree: Node) {
    visit(tree, 'text', (node: Literal) => {
      const value = node.value as string
      const { groups } = value.match(/!(?<type>\w+){(?<url>[^\s]+)\}/) || {}
      if (groups) {
        const { url = '', type = 'unknown' } = groups
        if (url) {
          node.type = type
          node.value = url
        }
      }
    })
  }
  return transformer
})

export const replaceLineBreak = $remark(() => () => {
  function transformer(tree: Node) {
    visit(tree, 'text', (node: Literal) => {
      const value = node.value as string
      node.value = value.replace(/\n{1}/g, ' ')
    })
  }
  return transformer
})
