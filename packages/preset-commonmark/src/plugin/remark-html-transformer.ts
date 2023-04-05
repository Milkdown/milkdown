/* Copyright 2021, Milkdown by Mirone. */
import { $remark } from '@milkdown/utils'
import type { Literal, Node, Parent } from 'unist'
import { withMeta } from '../__internal__'

const isParent = (node: Node): node is Parent => !!(node as Parent).children
const isHTML = (node: Node): node is Literal<string> => node.type === 'html'

function flatMapWithDepth(ast: Node, fn: (node: Node, index: number, parent: Node | null) => Node[]) {
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
              if (item)
                out.push(item)
            }
          }
        }
      }
      node.children = out
    }

    return fn(node, index, parent)
  }
}

/// @internal
/// This plugin should be deprecated after we support HTML.
export const remarkHtmlTransformer = $remark(() => () => (tree: Node) => {
  flatMapWithDepth(tree, (node, _index, parent) => {
    if (!isHTML(node))
      return [node]

    if (parent?.type === 'root') {
      (node as Literal & { children: Literal[] }).children = [{ ...node }]
      delete (node as Literal).value
      node.type = 'paragraph'
    }

    return [node]
  })
})

withMeta(remarkHtmlTransformer, {
  displayName: 'Remark<remarkHtmlTransformer>',
  group: 'Remark',
})
