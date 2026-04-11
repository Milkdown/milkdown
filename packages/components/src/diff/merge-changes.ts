import type { Change } from '@milkdown/prose/changeset'
import type { Node } from '@milkdown/prose/model'

import {
  getCustomBlockAncestor,
  getCustomBlockAt,
  getTopLevelBlockRange,
  trailingEmptyParagraphStart,
} from './doc-utils'

/// Half-open interval overlap: do [a1, a2) and [b1, b2) share any position?
function overlaps(a1: number, a2: number, b1: number, b2: number): boolean {
  return a1 < b2 && a2 > b1
}

/// Does a range [from, to) in `doc` touch a custom block?
///
/// Non-empty ranges use the full boundary check — a position at the edge
/// of a custom block counts as touching. Empty ranges (from === to) only
/// count if the anchor is *inside* a custom block's ancestor chain; a
/// point sitting between two top-level nodes isn't touching either
/// neighbour and shouldn't trigger custom-block merging.
function touchesCustomBlockRange(
  doc: Node,
  from: number,
  to: number,
  customBlockTypes: Set<string>
): boolean {
  if (from === to) {
    return getCustomBlockAncestor(doc, from, customBlockTypes) != null
  }
  return (
    getCustomBlockAt(doc, from, customBlockTypes) != null ||
    getCustomBlockAt(doc, to, customBlockTypes, true) != null
  )
}

export interface MergedChange {
  fromA: number
  toA: number
  fromB: number
  toB: number
  /// Whether this change was merged from a custom block node (table, image-block, etc.).
  isCustomBlock: boolean
}

export interface ChangeSegment {
  fromA: number
  toA: number
  fromB: number
  toB: number
  isBlock: boolean
}

/// Split a cross-boundary change into inline and block visual segments.
/// When fromA is inside a top-level textblock (e.g. a paragraph or heading
/// at doc level), produces an inline segment for the text portion and a
/// block segment for the remaining blocks.
///
/// Returns null if the change doesn't need splitting (not cross-boundary,
/// or fromA is not inside a top-level textblock — nested textblocks such
/// as list item paragraphs are excluded to avoid producing invalid DOM).
export function splitCrossBoundaryChange(
  doc: Node,
  newDoc: Node,
  change: MergedChange
): ChangeSegment[] | null {
  const $fromA = doc.resolve(change.fromA)

  // Only split if fromA is inside a textblock (inline content) AND
  // its depth-1 ancestor is itself a textblock. Otherwise (e.g. inside
  // a list item or blockquote), the inline segment would span block
  // content and produce invalid DOM (block elements inside <span>).
  if (!$fromA.parent.isTextblock || $fromA.depth < 1) return null
  if (!$fromA.node(1).isTextblock) return null

  // Find the end of the enclosing top-level block in old doc
  const blockEndA = $fromA.after(1)

  // Find the corresponding split point in newDoc: the first top-level
  // block boundary at or after fromB. Only produce an inline split when
  // fromB is also inside a top-level textblock — otherwise the inline
  // segment would contain block DOM (e.g. a list or blockquote) and
  // serialize to invalid HTML inside a <span>.
  const $fromB = newDoc.resolve(change.fromB)
  let splitB: number
  if ($fromB.depth >= 1 && $fromB.node(1).isTextblock) {
    splitB = $fromB.after(1)
    if (splitB > change.toB) splitB = change.toB
  } else {
    splitB = change.fromB
  }

  // No split needed if the change is entirely within one block on BOTH sides
  if (blockEndA >= change.toA && splitB >= change.toB) return null

  const segments: ChangeSegment[] = []

  // Inline segment: fromA..blockEndA in old doc, fromB..splitB in new doc
  if (blockEndA > change.fromA || splitB > change.fromB) {
    segments.push({
      fromA: change.fromA,
      toA: Math.min(blockEndA, change.toA),
      fromB: change.fromB,
      toB: splitB,
      isBlock: false,
    })
  }

  // Block segment: blockEndA..toA in old doc, splitB..toB in new doc.
  // Normalize so fromA <= toA — when the deletion stays within the current
  // textblock (change.toA <= blockEndA) but the insertion continues into
  // following blocks, the old-doc side has no remainder.
  if (change.toA > blockEndA || change.toB > splitB) {
    segments.push({
      fromA: blockEndA,
      toA: Math.max(blockEndA, change.toA),
      fromB: splitB,
      toB: change.toB,
      isBlock: true,
    })
  }

  return segments.length > 1 ? segments : null
}

/// Check if a change touches a custom block node in either document.
function changeTouchesCustomBlock(
  change: Change,
  doc: Node,
  newDoc: Node,
  customBlockTypes: Set<string>
): boolean {
  return (
    touchesCustomBlockRange(doc, change.fromA, change.toA, customBlockTypes) ||
    touchesCustomBlockRange(newDoc, change.fromB, change.toB, customBlockTypes)
  )
}

/// Merge changes that fall within custom block nodes (tables, image-blocks,
/// code blocks) into single block-level changes. This ensures proper rendering
/// for nodes that use custom node views where inline decorations don't work.
export function mergeBlockChanges(
  pending: readonly Change[],
  doc: Node,
  newDoc: Node,
  customBlockTypes: Set<string>
): MergedChange[] {
  const result: MergedChange[] = []
  const consumed = new Set<number>()

  for (let i = 0; i < pending.length; i++) {
    if (consumed.has(i)) continue

    const change = pending[i]!

    if (!changeTouchesCustomBlock(change, doc, newDoc, customBlockTypes)) {
      result.push({
        fromA: change.fromA,
        toA: change.toA,
        fromB: change.fromB,
        toB: change.toB,
        isCustomBlock: false,
      })
      continue
    }

    // Expand each side to the enclosing top-level block when that side
    // actually touches a custom block. For pure inserts/deletes, only the
    // ancestor check counts — a boundary anchor next to a block doesn't
    // drag the block into the merge.
    const blockRangeA = expandToCustomBlockRange(
      doc,
      change.fromA,
      change.toA,
      customBlockTypes
    )
    const blockRangeB = expandToCustomBlockRange(
      newDoc,
      change.fromB,
      change.toB,
      customBlockTypes
    )

    // Union of the block range and the original change range so we don't
    // truncate changes that extend beyond the block.
    const merged: MergedChange = {
      fromA: Math.min(blockRangeA?.from ?? change.fromA, change.fromA),
      toA: Math.max(blockRangeA?.to ?? change.toA, change.toA),
      fromB: Math.min(blockRangeB?.from ?? change.fromB, change.fromB),
      toB: Math.max(blockRangeB?.to ?? change.toB, change.toB),
      isCustomBlock: true,
    }
    consumed.add(i)

    // Absorb any later changes that overlap the block range in either doc.
    for (let j = i + 1; j < pending.length; j++) {
      if (consumed.has(j)) continue
      const other = pending[j]!
      const overlapA =
        blockRangeA &&
        overlaps(other.fromA, other.toA, blockRangeA.from, blockRangeA.to)
      const overlapB =
        blockRangeB &&
        overlaps(other.fromB, other.toB, blockRangeB.from, blockRangeB.to)
      if (!overlapA && !overlapB) continue
      consumed.add(j)
      merged.fromA = Math.min(merged.fromA, other.fromA)
      merged.toA = Math.max(merged.toA, other.toA)
      merged.fromB = Math.min(merged.fromB, other.fromB)
      merged.toB = Math.max(merged.toB, other.toB)
    }

    // Coalesce with an already-emitted merged change whose custom-block
    // range overlaps this one. Two seed changes can independently expand
    // to cover the same custom block (e.g. a deletion just before a table
    // and an insertion just after it), which would otherwise render the
    // same block as a widget twice.
    const existing = result.find(
      (prev) =>
        prev.isCustomBlock &&
        (overlaps(merged.fromA, merged.toA, prev.fromA, prev.toA) ||
          overlaps(merged.fromB, merged.toB, prev.fromB, prev.toB))
    )
    if (existing) {
      existing.fromA = Math.min(existing.fromA, merged.fromA)
      existing.toA = Math.max(existing.toA, merged.toA)
      existing.fromB = Math.min(existing.fromB, merged.fromB)
      existing.toB = Math.max(existing.toB, merged.toB)
    } else {
      result.push(merged)
    }
  }

  return result
}

/// Remap pure inserts that sit at or past the doc's run of trailing empty
/// paragraphs so they anchor *before* the empty paragraph instead of after.
///
/// Editors like Crepe always keep an empty paragraph at the doc end. A pure
/// insert produced at `fromA === doc.content.size` would otherwise be spliced
/// after the trailing empty paragraph, pushing it out of its trailing slot.
/// The next diff recompute would then see the empty paragraph as middle-of-doc
/// content that needs to be deleted, flashing an empty-looking removal widget.
export function anchorTrailingInsertsBeforeEmptyParagraph(
  changes: MergedChange[],
  doc: Node
): void {
  const trailingStart = trailingEmptyParagraphStart(doc)
  if (trailingStart === doc.content.size) return
  for (const change of changes) {
    const isPureInsert =
      change.fromA === change.toA && change.fromB < change.toB
    if (isPureInsert && change.fromA >= trailingStart) {
      change.fromA = trailingStart
      change.toA = trailingStart
    }
  }
}

/// Pick the top-level block range enclosing a custom block touched by
/// [from, to). Returns null if neither endpoint actually touches a custom
/// block (see `touchesCustomBlockRange` for the touch rules).
function expandToCustomBlockRange(
  doc: Node,
  from: number,
  to: number,
  customBlockTypes: Set<string>
): { from: number; to: number } | null {
  if (from === to) {
    if (getCustomBlockAncestor(doc, from, customBlockTypes) == null) return null
    return getTopLevelBlockRange(doc, from)
  }
  if (getCustomBlockAt(doc, from, customBlockTypes) != null) {
    return getTopLevelBlockRange(doc, from)
  }
  if (getCustomBlockAt(doc, to, customBlockTypes, true) != null) {
    return getTopLevelBlockRange(doc, to, true)
  }
  return null
}
