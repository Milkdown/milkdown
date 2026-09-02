import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { SKIP, visitParents } from 'unist-util-visit-parents'

import { isBrHtmlValue, withMeta } from '../__internal__'
import { getBlockContainerTypes } from './block-container-types'

type ParentNode = Node & { children: Node[] }

// The serializer emits its empty-line placeholder in two shapes. The
// first is a lone <br /> inside a paragraph, or inside a table cell,
// where mdast flattens a paragraph. The second is a <br /> directly
// inside a block container, before `remarkHtmlTransformer` wraps it.
// This plugin folds those two shapes back into empty paragraphs and
// keeps every other <br> as user-authored inline HTML.
//
// 'tableCell' is a GFM type, and it ships here for the same
// compatibility reason as the `blockContainerTypes` defaults. A phrasing
// container has no registration point, unlike a flow container. That is
// deliberate: this preset's serializer defines the placeholder shapes,
// and a third-party phrasing container that emits its own placeholder
// folds it in its own remark plugin. Never add a phrasing type to
// `blockContainerTypes`. See its doc comment.
const PLACEHOLDER_PARENTS = new Set(['paragraph', 'tableCell'])

function visitEmptyLine(ast: Node, blockContainers: ReadonlySet<string>) {
  return visitParents(
    ast,
    (node: Node) =>
      node.type === 'html' &&
      isBrHtmlValue((node as Node & { value?: string }).value),
    (node: Node, parents: Node[]) => {
      const parent = parents[parents.length - 1] as ParentNode | undefined
      if (!parent) return undefined

      if (PLACEHOLDER_PARENTS.has(parent.type)) {
        if (parent.children.length === 1) parent.children = []
        return undefined
      }

      if (blockContainers.has(parent.type)) {
        // The <br> sits directly in block content, which only happens when
        // `remarkHtmlTransformer` has not wrapped it (standalone
        // composition). Left alone it would be an inline atom in a
        // block-only position and the parser would drop the entire
        // container, so fold it into an empty paragraph in place; SKIP so
        // the rewritten node is not revisited.
        const mutable = node as ParentNode & { value?: string }
        mutable.children = []
        delete mutable.value
        mutable.type = 'paragraph'
        return SKIP
      }

      // Under any other parent, such as a heading, a link, an emphasis
      // or an unknown container, the <br> is user content. Keep it, the
      // same as any other inline html tag.
      return undefined
    }
  )
}

/// This plugin makes the empty-line placeholder of the serializer
/// round-trip. The serializer writes a preserved empty paragraph as a
/// lone `<br />`. See `paragraphSchema`. On load this plugin folds the
/// placeholder back into an empty paragraph. A placeholder is a `<br>`
/// that is the only child of a paragraph or a table cell, or a `<br>`
/// that sits on its own between blocks. Any other `<br>` is
/// user-authored HTML and stays, for example one with siblings or one
/// inside a heading, a link or an emphasis.
///
/// In the composed presets `remarkHtmlTransformer` runs first and wraps
/// block-level HTML into paragraphs; this plugin also folds unwrapped
/// block-level `<br>`s itself, so it stays safe without the transformer.
export const remarkPreserveEmptyLinePlugin = $remark(
  'remark-preserve-empty-line',
  (ctx) => () => (ast: Node) =>
    // Read per run so containers registered after setup are picked up.
    visitEmptyLine(ast, getBlockContainerTypes(ctx))
)

withMeta(remarkPreserveEmptyLinePlugin.plugin, {
  displayName: 'Remark<remarkPreserveEmptyLine>',
  group: 'Remark',
})

withMeta(remarkPreserveEmptyLinePlugin.options, {
  displayName: 'RemarkConfig<remarkPreserveEmptyLine>',
  group: 'Remark',
})
