import type { Node } from '@milkdown/prose/model'

import { Decoration } from '@milkdown/prose/view'

import { DIFF_CLASS_PREFIX } from './config'

/// Check if a position range in a doc crosses a top-level block boundary.
export function isBlockSpanning(doc: Node, from: number, to: number): boolean {
  if (from === to) return false

  const $from = doc.resolve(from)
  const $to = doc.resolve(to)

  // At depth 0 the position sits between top-level nodes, and index(0)
  // gives the child that starts at or after it. The `to` endpoint of a
  // half-open range needs the previous child instead.
  const fromIndex = $from.index(0)
  const toIndex = $to.depth === 0 ? Math.max(0, $to.index(0) - 1) : $to.index(0)

  return fromIndex !== toIndex
}

/// Check if a range in a doc contains any fully-enclosed block node.
/// Return false for a purely inline range. Also return false for a
/// one-character attribute-token edit that only touches a block node's
/// open or close boundary and encloses no block content.
export function hasBlockContent(doc: Node, from: number, to: number): boolean {
  if (from >= to) return false

  // Fast path: endpoints that share one textblock parent make the range
  // purely inline, so it crosses no block.
  const $from = doc.resolve(from)
  const $to = doc.resolve(to)
  if ($from.sameParent($to) && $from.parent.isTextblock) return false

  // Only a block node fully enclosed by [from, to] counts. A wrapper
  // that partially overlaps the range, such as a bullet_list around it,
  // does not count. `isBlockSpanning` catches a real cross-block edit.
  let found = false
  doc.nodesBetween(from, to, (node, pos) => {
    if (found) return false
    if (!node.isBlock) return true
    const nodeEnd = pos + node.nodeSize
    if (pos >= from && nodeEnd <= to) {
      found = true
      return false
    }
    // The node only partially overlaps, so descend into its children.
    return true
  })
  return found
}

/// Check if a range in a doc covers only trailing empty paragraphs at the end.
export function coversOnlyTrailingEmptyParagraphs(
  doc: Node,
  from: number,
  to: number
): boolean {
  if (to !== doc.content.size) return false

  const $from = doc.resolve(from)
  if ($from.depth !== 0) return false

  for (let i = $from.index(0); i < doc.childCount; i++) {
    const child = doc.child(i)
    if (child.type.name !== 'paragraph' || child.content.size > 0) return false
  }
  return true
}

/// Return the top-level position where the run of trailing empty
/// paragraphs begins. Return `doc.content.size` when the doc has no
/// trailing empty paragraph. A Crepe-like editor always keeps an empty
/// paragraph at the end. An insert that targets the doc end anchors
/// here, so the empty paragraph stays last.
export function trailingEmptyParagraphStart(doc: Node): number {
  let start = doc.content.size
  for (let i = doc.childCount - 1; i >= 0; i--) {
    const child = doc.child(i)
    if (child.type.name !== 'paragraph' || child.content.size > 0) break
    start -= child.nodeSize
  }
  return start
}

/// Find a position between blocks for a block-level widget, not a
/// position inside an inline-content node such as a paragraph or a
/// heading. Walk up the tree to the first node that takes block
/// children, then snap to the boundary at that depth.
export function snapToBlockBoundary(doc: Node, pos: number): number {
  const $pos = doc.resolve(pos)
  for (let d = $pos.depth; d >= 1; d--) {
    const parent = $pos.node(d)
    // If this node only allows inline content, snap to before it
    // so the widget renders between sibling blocks.
    if (parent.isTextblock) {
      return $pos.before(d)
    }
  }
  return pos
}

/// Iterate top-level nodes that overlap a position range [from, to).
export function forEachTopLevelNodeInRange(
  doc: Node,
  from: number,
  to: number,
  callback: (node: Node, start: number, end: number) => void
): void {
  let pos = 0
  for (let i = 0; i < doc.childCount; i++) {
    const child = doc.child(i)
    const nodeEnd = pos + child.nodeSize
    if (pos >= to) break
    if (nodeEnd > from && pos < to) callback(child, pos, nodeEnd)
    pos = nodeEnd
  }
}

/// Add a node-level deletion decoration for each top-level block in a
/// range. `Decoration.node` puts the class on the node's outer DOM
/// wrapper. This reaches a custom node view, such as CodeMirror or
/// image-block, that `Decoration.inline` cannot enter.
export function addBlockDeletionDecorations(
  doc: Node,
  from: number,
  to: number,
  decorations: Decoration[]
): void {
  forEachTopLevelNodeInRange(doc, from, to, (node, start, end) => {
    // A trailing empty paragraph is an editor placeholder, not content.
    if (
      end === doc.content.size &&
      node.type.name === 'paragraph' &&
      node.content.size === 0
    )
      return

    decorations.push(
      Decoration.node(start, end, {
        class: `${DIFF_CLASS_PREFIX}-removed-block`,
      })
    )
  })
}

/// Find the enclosing top-level block range for a position. Return
/// `{ from, to }` that covers the whole block at depth 1.
///
/// At depth 0 the position sits between top-level nodes. If
/// `endBoundary` is true, prefer the node before the position. Pass it
/// for an exclusive range end, so the range covers the block the edit
/// touches instead of the next node.
export function getTopLevelBlockRange(
  doc: Node,
  pos: number,
  endBoundary = false
): { from: number; to: number } | null {
  if (pos < 0 || pos > doc.content.size) return null

  const $pos = doc.resolve(Math.min(pos, doc.content.size))
  if ($pos.depth >= 1) {
    return {
      from: $pos.before(1),
      to: $pos.after(1),
    }
  }

  // Depth 0: the position sits between top-level nodes. Pick the
  // adjacent node on the side the range touches.
  if (endBoundary) {
    const nodeBefore = $pos.nodeBefore
    if (nodeBefore) {
      return { from: pos - nodeBefore.nodeSize, to: pos }
    }
    const nodeAfter = $pos.nodeAfter
    if (nodeAfter) {
      return { from: pos, to: pos + nodeAfter.nodeSize }
    }
  } else {
    const nodeAfter = $pos.nodeAfter
    if (nodeAfter) {
      return { from: pos, to: pos + nodeAfter.nodeSize }
    }
    const nodeBefore = $pos.nodeBefore
    if (nodeBefore) {
      return { from: pos - nodeBefore.nodeSize, to: pos }
    }
  }
  return null
}

/// Check only the ancestor chain of `pos` for a custom block. Unlike
/// `getCustomBlockAt`, this function ignores `nodeBefore` and
/// `nodeAfter`. It returns null for a position that only sits at the
/// boundary between two top-level blocks. Use it for an empty range,
/// where a boundary anchor must not count as touching a neighbour.
export function getCustomBlockAncestor(
  doc: Node,
  pos: number,
  customBlockTypes: Set<string>
): string | null {
  if (pos < 0 || pos > doc.content.size) return null
  const $pos = doc.resolve(Math.min(pos, doc.content.size))
  for (let d = $pos.depth; d >= 0; d--) {
    const name = $pos.node(d).type.name
    if (customBlockTypes.has(name)) return name
  }
  return null
}

/// Check if a position falls inside or at a custom block node. Return
/// the node type name, or null.
///
/// If `endBoundary` is true, a position right after an atom custom
/// block also counts as touching it. Pass it only for an exclusive
/// range end. Leave it false for a point position or a range start, so
/// an edit next to a custom block does not count as inside it.
export function getCustomBlockAt(
  doc: Node,
  pos: number,
  customBlockTypes: Set<string>,
  endBoundary = false
): string | null {
  const ancestor = getCustomBlockAncestor(doc, pos, customBlockTypes)
  if (ancestor) return ancestor

  // The position sits outside every custom block ancestor, so check the
  // sibling on the touched side. A range start or a point position
  // touches `nodeAfter`, which covers an atom node such as image-block.
  // An exclusive range end touches `nodeBefore`, because `nodeAfter`
  // lies past the range.
  const $pos = doc.resolve(Math.min(Math.max(pos, 0), doc.content.size))
  const sibling = endBoundary ? $pos.nodeBefore : $pos.nodeAfter
  if (sibling && customBlockTypes.has(sibling.type.name))
    return sibling.type.name
  return null
}

/// Collect the complete top-level nodes inside a position range.
/// Return an empty array when the range does not align with node
/// boundaries.
export function collectTopLevelNodes(
  doc: Node,
  from: number,
  to: number
): Node[] {
  const nodes: Node[] = []
  let aligned = true
  let firstStart = -1
  let lastEnd = -1
  forEachTopLevelNodeInRange(doc, from, to, (node, start, end) => {
    if (firstStart === -1) firstStart = start
    lastEnd = end
    nodes.push(node)
  })
  if (nodes.length === 0 || firstStart !== from || lastEnd !== to) {
    aligned = false
  }
  return aligned ? nodes : []
}
