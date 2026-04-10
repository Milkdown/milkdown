import type { Change } from '@milkdown/prose/changeset'
import type { Node } from '@milkdown/prose/model'

import { getCustomBlockAt, getTopLevelBlockRange } from './doc-utils'

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
    getCustomBlockAt(doc, change.fromA, customBlockTypes) != null ||
    getCustomBlockAt(doc, change.toA, customBlockTypes, true) != null ||
    getCustomBlockAt(newDoc, change.fromB, customBlockTypes) != null ||
    getCustomBlockAt(newDoc, change.toB, customBlockTypes, true) != null
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

    // Only expand each side when that side actually touches a custom block.
    // Choose the endpoint based on which one actually touches the custom
    // block — otherwise getTopLevelBlockRange would return an unrelated
    // adjacent node.
    const aFromTouches =
      getCustomBlockAt(doc, change.fromA, customBlockTypes) != null
    const aToTouches =
      getCustomBlockAt(doc, change.toA, customBlockTypes, true) != null
    const bFromTouches =
      getCustomBlockAt(newDoc, change.fromB, customBlockTypes) != null
    const bToTouches =
      getCustomBlockAt(newDoc, change.toB, customBlockTypes, true) != null
    const blockRangeA = aFromTouches
      ? getTopLevelBlockRange(doc, change.fromA)
      : aToTouches
        ? getTopLevelBlockRange(doc, change.toA, true)
        : null
    const blockRangeB = bFromTouches
      ? getTopLevelBlockRange(newDoc, change.fromB)
      : bToTouches
        ? getTopLevelBlockRange(newDoc, change.toB, true)
        : null

    // Collect all changes that overlap with this block.
    // Use the union of the block range and the original change range
    // so we don't truncate changes that extend beyond the block.
    const merged: MergedChange = {
      fromA: Math.min(blockRangeA?.from ?? change.fromA, change.fromA),
      toA: Math.max(blockRangeA?.to ?? change.toA, change.toA),
      fromB: Math.min(blockRangeB?.from ?? change.fromB, change.fromB),
      toB: Math.max(blockRangeB?.to ?? change.toB, change.toB),
      isCustomBlock: true,
    }
    consumed.add(i)

    for (let j = i + 1; j < pending.length; j++) {
      if (consumed.has(j)) continue

      const other = pending[j]!
      // Check if the other change overlaps with the block range in either doc
      // Use exclusive end boundary to avoid absorbing changes that start right after the block
      const overlapA =
        blockRangeA &&
        other.fromA < blockRangeA.to &&
        other.toA > blockRangeA.from
      const overlapB =
        blockRangeB &&
        other.fromB < blockRangeB.to &&
        other.toB > blockRangeB.from

      if (overlapA || overlapB) {
        consumed.add(j)
        // Expand the merged range to include this change
        merged.fromA = Math.min(merged.fromA, other.fromA)
        merged.toA = Math.max(merged.toA, other.toA)
        merged.fromB = Math.min(merged.fromB, other.fromB)
        merged.toB = Math.max(merged.toB, other.toB)
      }
    }

    result.push(merged)
  }

  return result
}
