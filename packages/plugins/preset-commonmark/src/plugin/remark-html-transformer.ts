import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'

import { cloneLeaf, withMeta } from '../__internal__'
import { getBlockContainerTypes } from './block-container-types'

const isParent = (node: Node): node is Node & { children: Node[] } =>
  !!(node as Node & { children: Node[] }).children
const isHTML = (
  node: Node
): node is Node & { children: Node[]; value: unknown } => node.type === 'html'

function flatMapWithDepth(
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

/// @internal
/// This plugin should be deprecated after we support HTML.
export const remarkHtmlTransformer = $remark(
  'remarkHTMLTransformer',
  (ctx) => () => (tree: Node) => {
    // Read per run so containers registered after setup are picked up.
    const containers = getBlockContainerTypes(ctx)
    flatMapWithDepth(tree, (node, _index, parent) => {
      if (!isHTML(node)) return [node]

      // If the parent is a block container that expects block content,
      // wrap the HTML in a paragraph node
      if (parent && containers.has(parent.type)) {
        node.children = [cloneLeaf(node)]
        delete node.value
        ;(node as { type: string }).type = 'paragraph'
      }

      return [node]
    })
  }
)

withMeta(remarkHtmlTransformer.plugin, {
  displayName: 'Remark<remarkHtmlTransformer>',
  group: 'Remark',
})

withMeta(remarkHtmlTransformer.options, {
  displayName: 'RemarkConfig<remarkHtmlTransformer>',
  group: 'Remark',
})
