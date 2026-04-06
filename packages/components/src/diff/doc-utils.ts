import type { Node } from '@milkdown/prose/model'

import { Decoration } from '@milkdown/prose/view'

/// Check if a position range in a doc crosses a top-level block boundary.
export function isBlockSpanning(doc: Node, from: number, to: number): boolean {
  if (from === to) return false

  const $from = doc.resolve(from)
  const $to = doc.resolve(to)

  // Determine which top-level child contains each endpoint.
  // For depth-0 positions (between top-level nodes), index(0) gives the
  // child that starts at or after the position — for the `to` endpoint
  // of a half-open range we use the previous child instead.
  const fromIndex = $from.index(0)
  const toIndex = $to.depth === 0 ? Math.max(0, $to.index(0) - 1) : $to.index(0)

  return fromIndex !== toIndex
}

/// Check if a slice from a doc contains block-level content.
export function hasBlockContent(doc: Node, from: number, to: number): boolean {
  if (from >= to) return false

  const slice = doc.slice(from, to)
  for (let i = 0; i < slice.content.childCount; i++) {
    if (slice.content.child(i).isBlock) return true
  }
  return false
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

  // Check all nodes from `from` to end are empty paragraphs
  for (let i = $from.index(0); i < doc.childCount; i++) {
    const child = doc.child(i)
    if (child.type.name !== 'paragraph' || child.content.size > 0) return false
  }
  return true
}

/// For block-level widgets, find a position between blocks rather than
/// inside an inline-content node (paragraph, heading). Walks up the
/// tree until it finds a node that can contain block children, then
/// snaps to the boundary at that depth.
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

/// Add node-level deletion decorations for each top-level block in a range.
/// Uses Decoration.node so the class is applied to the node's outer DOM wrapper,
/// which works with custom node views (CodeMirror, image-block, etc.)
/// where Decoration.inline cannot penetrate.
export function addBlockDeletionDecorations(
  doc: Node,
  from: number,
  to: number,
  classPrefix: string,
  decorations: Decoration[]
): void {
  forEachTopLevelNodeInRange(doc, from, to, (node, start, end) => {
    // Skip trailing empty paragraphs (editor placeholders)
    if (
      end === doc.content.size &&
      node.type.name === 'paragraph' &&
      node.content.size === 0
    )
      return

    decorations.push(
      Decoration.node(start, end, {
        class: `${classPrefix}-removed-block`,
      })
    )
  })
}

/// Find the enclosing top-level block node range for a position.
/// Returns { from, to } covering the entire block at depth 1.
///
/// When `endBoundary` is true and the position sits at depth 0 (between
/// top-level nodes), prefer the node *before* the position. Use this for
/// exclusive range ends so the returned range covers the block that was
/// actually touched (not the unrelated next node).
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

  // Depth 0: position sits between top-level nodes. Pick the adjacent node —
  // prefer the one on the side that was actually touched by the range.
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

/// Check if a position falls inside or at a custom block node in the given document.
/// Returns the node type name if found, or null.
///
/// When `endBoundary` is true, a position immediately *after* an atom custom
/// block is also considered touching it — use this only for exclusive range
/// end positions. For point positions or range starts, leave it false so that
/// edits adjacent to a custom block are not misclassified as inside it.
export function getCustomBlockAt(
  doc: Node,
  pos: number,
  customBlockTypes: Set<string>,
  endBoundary = false
): string | null {
  if (pos < 0 || pos > doc.content.size) return null

  const $pos = doc.resolve(Math.min(pos, doc.content.size))

  // Check ancestor nodes (for positions inside tables, code blocks, etc.)
  for (let d = $pos.depth; d >= 0; d--) {
    const name = $pos.node(d).type.name
    if (customBlockTypes.has(name)) return name
  }

  // For range starts and point positions, check the node immediately after
  // the position (atom/leaf nodes like image-block are touched by the start).
  // For exclusive range ends, check the node immediately before instead —
  // `nodeAfter` is past the range end and not actually touched.
  if (endBoundary) {
    const nodeBefore = $pos.nodeBefore
    if (nodeBefore && customBlockTypes.has(nodeBefore.type.name))
      return nodeBefore.type.name
  } else {
    const nodeAfter = $pos.nodeAfter
    if (nodeAfter && customBlockTypes.has(nodeAfter.type.name))
      return nodeAfter.type.name
  }

  return null
}

/// Collect complete top-level nodes within a position range.
/// Returns empty array if the range doesn't align with node boundaries.
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
  // Validate the range starts and ends exactly on node boundaries
  if (nodes.length === 0 || firstStart !== from || lastEnd !== to) {
    aligned = false
  }
  return aligned ? nodes : []
}
