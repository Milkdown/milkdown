import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { visitParents } from 'unist-util-visit-parents'

import { cloneNodeWithPosition, isBrHtmlValue, withMeta } from '../__internal__'

type ParentNode = Node & { children: Node[] }

// A lone <br> inside a paragraph or table cell is the serializer's
// empty-line placeholder (see `paragraphSchema`). Under every other
// phrasing parent (heading, link, emphasis, ...) a lone <br> is
// user-authored HTML and must be kept.
const PLACEHOLDER_PARENTS = new Set(['paragraph', 'tableCell'])
const PHRASING_PARENTS = new Set([
  'paragraph',
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

      if (PLACEHOLDER_PARENTS.has(parent.type)) {
        if (parent.children.length !== 1) return
        // The serializer never re-emits a placeholder for the document's
        // last paragraph, so a trailing lone <br> can only be user content:
        // keep it, or it would be lost on the next serialize.
        const grandparent = parents[parents.length - 2] as
          | ParentNode
          | undefined
        if (
          parent.type === 'paragraph' &&
          grandparent?.type === 'root' &&
          isLastChild(grandparent, parent)
        )
          return
        parent.children = []
        return
      }

      if (PHRASING_PARENTS.has(parent.type)) return

      // The <br> sits directly in block content: either its container is
      // not wrapped by `remarkHtmlTransformer` (which only knows a fixed
      // set of containers), or this plugin runs without the transformer.
      // Left alone it would be an inline atom in a block-only position and
      // the parser would drop the entire container, so rewrite it into the
      // paragraph shape the placeholder branch understands.
      const mutable = node as ParentNode & { value?: string }
      if (parent.type === 'root' && isLastChild(parent, node)) {
        mutable.children = [cloneNodeWithPosition(node)]
      } else {
        mutable.children = []
      }
      delete mutable.value
      mutable.type = 'paragraph'
    }
  )
}

/// This plugin makes the serializer's empty-line placeholders round-trip.
/// The serializer represents a preserved empty paragraph as a lone
/// `<br />` (see `paragraphSchema`); on load this plugin folds such a
/// placeholder — a `<br>` that is the sole child of a paragraph or table
/// cell, or a `<br>` sitting on its own between blocks — back into an
/// empty paragraph. User-authored `<br>`s are kept: any `<br>` with
/// siblings, inside another phrasing parent (heading, link, emphasis,
/// ...), or trailing at the end of the document.
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
