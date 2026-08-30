import type { Node } from '@milkdown/transformer'

import { $remark } from '@milkdown/utils'
import { SKIP, visitParents } from 'unist-util-visit-parents'

import { isBrHtmlValue, withMeta } from '../__internal__'
import { getBlockContainerTypes } from './block-container-types'

type ParentNode = Node & { children: Node[] }

// The serializer emits its empty-line placeholder in exactly two shapes:
// a lone <br /> inside a paragraph (or a table cell, where paragraphs are
// flattened in mdast), and — before `remarkHtmlTransformer` wraps it — a
// <br /> directly inside a block container. This plugin folds exactly
// those shapes back into empty paragraphs and keeps every other <br> as
// user-authored inline HTML.
//
// 'tableCell' is a GFM type shipped here for the same compat pragmatism
// as `blockContainerTypes`' defaults. Unlike flow containers, phrasing
// containers have no registration point, deliberately: the placeholder
// shapes are defined by this preset's serializer, and a third-party
// phrasing container that emits its own placeholders can fold them in
// its own remark plugin. Do NOT add phrasing types to
// `blockContainerTypes` (see its doc comment).
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

      // Any other parent (heading, link, emphasis, unknown containers):
      // the <br> is user content — keep it, exactly like any other inline
      // html tag.
      return undefined
    }
  )
}

/// This plugin makes the serializer's empty-line placeholders round-trip.
/// The serializer represents a preserved empty paragraph as a lone
/// `<br />` (see `paragraphSchema`); on load this plugin folds such a
/// placeholder — a `<br>` that is the sole child of a paragraph or table
/// cell, or a `<br>` sitting on its own between blocks — back into an
/// empty paragraph. Any other `<br>` (with siblings, or inside another
/// parent such as a heading, link, or emphasis) is user-authored HTML and
/// is kept.
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
