import type { Node, RemarkPluginRaw } from '@milkdown/transformer'
import emojiRegex from 'emoji-regex'

import { type TwemojiOptions, parse } from './parse'

const regex = emojiRegex()

const isParent = (node: Node): node is Node & { children: Node[] } =>
  !!(node as Node & { children: Node[] }).children
const isLiteral = (node: Node): node is Node & { value: string } =>
  !!(node as Node & { value: string }).value

function flatMap(
  ast: Node,
  fn: (node: Node, index: number, parent: Node | null) => Node[]
) {
  return transform(ast, 0, null)[0]

  function transform(node: Node, index: number, parent: Node | null) {
    if (isParent(node)) {
      const out = []
      for (let i = 0, n = node.children.length; i < n; i++) {
        const nthChild = node.children[i]
        if (nthChild) {
          const xs = transform(nthChild, i, node)
          if (xs) {
            for (let j = 0, m = xs.length; j < m; j++) {
              const item = xs[j]
              if (item) out.push(item)
            }
          }
        }
      }
      node.children = out
    }

    return fn(node, index, parent)
  }
}

export const twemojiPlugin: RemarkPluginRaw<TwemojiOptions> = (
  twemojiOptions
) => {
  function transformer(tree: Node) {
    flatMap(tree, (node) => {
      if (!isLiteral(node)) return [node]

      // Should not convert code block
      if (node.type === 'code') return [node]

      const value = node.value
      const output: Array<Node & { value: string }> = []
      let match
      let str = value
      while ((match = regex.exec(str))) {
        const { index } = match
        const emoji = match[0]
        if (emoji) {
          if (index > 0) output.push({ ...node, value: str.slice(0, index) })

          output.push({
            ...node,
            value: parse(emoji, twemojiOptions),
            type: 'emoji',
          })
          str = str.slice(index + emoji.length)
        }
        regex.lastIndex = 0
      }
      if (str.length) output.push({ ...node, value: str })

      return output
    })
  }
  return transformer
}
