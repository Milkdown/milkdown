import type { DetachedSource, Node, SourceUse } from '@milkdown/transformer'

import { recordDetachedSource } from '@milkdown/transformer'
import { $remark } from '@milkdown/utils'
import remarkInlineLinks from 'remark-inline-links'
import { visit } from 'unist-util-visit'

import { withMeta } from '../__internal__'

type Identified = Node & { identifier: string }

const isDefinition = (node: Node): node is Identified =>
  node.type === 'definition'
const isReference = (node: Node): node is Identified =>
  node.type === 'linkReference' || node.type === 'imageReference'

// The plugin below removes every definition from the tree, so the text of
// a definition has no node in the document. Tell the parser where that
// text is and which references need it. Source preservation then keeps a
// definition for as long as a block still refers to it.
function recordDefinitions(tree: Node) {
  const detached: DetachedSource[] = []
  const uses: SourceUse[] = []

  visit(tree, (node: Node) => {
    const from = node.position?.start.offset
    const to = node.position?.end.offset
    if (from == null || to == null) return

    if (isDefinition(node)) detached.push({ from, to, id: node.identifier })
    else if (isReference(node)) uses.push({ offset: from, id: node.identifier })
  })

  recordDetachedSource(tree, { detached, uses })
}

/// This plugin wraps
/// [remark-inline-links](https://github.com/remarkjs/remark-inline-links).
export const remarkInlineLinkPlugin = $remark('remarkInlineLink', () => () => {
  const inlineLinks = remarkInlineLinks()
  return (tree) => {
    recordDefinitions(tree)
    inlineLinks(tree)
  }
})

withMeta(remarkInlineLinkPlugin.plugin, {
  displayName: 'Remark<remarkInlineLinkPlugin>',
  group: 'Remark',
})

withMeta(remarkInlineLinkPlugin.options, {
  displayName: 'RemarkConfig<remarkInlineLinkPlugin>',
  group: 'Remark',
})
