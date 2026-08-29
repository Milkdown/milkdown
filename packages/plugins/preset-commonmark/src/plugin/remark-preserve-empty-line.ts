import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { SKIP, visitParents } from 'unist-util-visit-parents'

import {
  BLOCK_CONTAINER_TYPES,
  cloneLeaf,
  isBrHtmlValue,
  withMeta,
} from '../__internal__'

type ParentNode = Node & { children: Node[] }

// Phrasing parents where a <br> is always user-authored inline HTML.
// A lone <br> directly inside a paragraph is the serializer's empty-line
// placeholder instead and is handled separately.
const PHRASING_PARENTS = new Set([
  'heading',
  'tableCell',
  'link',
  'linkReference',
  'emphasis',
  'strong',
  'delete',
  'footnote',
])

const isLastChild = (parent: ParentNode, node: Node) =>
  parent.children[parent.children.length - 1] === node

function visitEmptyLine(ast: Node) {
  return visitParents(
    ast,
    (node: Node) =>
      node.type === 'html' &&
      isBrHtmlValue((node as Node & { value?: string }).value),
    (node: Node, parents: Node[]) => {
      const parent = parents[parents.length - 1] as ParentNode | undefined
      if (!parent) return

      if (parent.type === 'paragraph') {
        if (parent.children.length !== 1) return
        // The serializer never emits a placeholder into the trailing run of
        // empty paragraphs (see `paragraphSchema`), so a trailing lone <br>
        // can only be user content: keep it, or it would be lost on the
        // next serialize.
        const grandparent = parents[parents.length - 2] as
          | ParentNode
          | undefined
        if (grandparent?.type === 'root' && isLastChild(grandparent, parent))
          return
        parent.children = []
        return
      }

      if (BLOCK_CONTAINER_TYPES.has(parent.type)) {
        // The <br> sits directly in block content, which only happens when
        // `remarkHtmlTransformer` has not wrapped it (standalone
        // composition). Left alone it would be an inline atom in a
        // block-only position and the parser would drop the entire
        // container, so rewrite it into the paragraph shape the branch
        // above expects; SKIP so the rewritten node is not revisited.
        const mutable = node as ParentNode & { value?: string }
        if (parent.type === 'root' && isLastChild(parent, node)) {
          mutable.children = [cloneLeaf(node)]
        } else {
          mutable.children = []
        }
        delete mutable.value
        mutable.type = 'paragraph'
        return SKIP
      }

      if (PHRASING_PARENTS.has(parent.type)) return

      // Unknown parent (e.g. a third-party remark container): we cannot
      // know whether it holds phrasing or flow content, and a wrong guess
      // corrupts the container either way. Removing the <br> is the only
      // structurally safe option and the historical behavior.
      const index = parent.children.indexOf(node)
      if (index < 0) return
      parent.children.splice(index, 1)
      return index
    }
  )
}

/// This plugin makes the serializer's empty-line placeholders round-trip.
/// The serializer represents a preserved empty paragraph as a lone
/// `<br />` (see `paragraphSchema`); on load this plugin folds such a
/// placeholder — a `<br>` that is the sole child of a paragraph, or a
/// `<br>` sitting on its own between blocks — back into an empty
/// paragraph. User-authored `<br>`s are kept: any `<br>` with siblings,
/// inside another phrasing parent (heading, link, emphasis, table cell,
/// ...), or trailing at the end of the document (where the serializer
/// never emits a placeholder). Inside unknown containers the `<br>` is
/// removed, the only structurally safe default.
///
/// In the composed presets `remarkHtmlTransformer` runs first and wraps
/// block-level HTML into paragraphs; this plugin also handles unwrapped
/// block-level `<br>`s itself, so it stays safe without the transformer.
export const remarkPreserveEmptyLinePlugin = $remark(
  'remark-preserve-empty-line',
  () => () => visitEmptyLine
)

withMeta(remarkPreserveEmptyLinePlugin.plugin, {
  displayName: 'Remark<remarkPreserveEmptyLine>',
  group: 'Remark',
})

withMeta(remarkPreserveEmptyLinePlugin.options, {
  displayName: 'RemarkConfig<remarkPreserveEmptyLine>',
  group: 'Remark',
})
