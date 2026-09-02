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
/// A non-empty range uses the full boundary check, so a position at the edge of
/// a custom block counts as touching. An empty range counts only when the
/// anchor sits inside a custom block ancestor chain. A point between two
/// top-level nodes touches neither neighbour, so it starts no custom-block
/// merge.
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
  /// Whether the merge came from a custom block node, such as a table
  /// or an image-block.
  isCustomBlock: boolean
}

export interface ChangeSegment {
  fromA: number
  toA: number
  fromB: number
  toB: number
  isBlock: boolean
}

/// Split a cross-boundary change into an inline segment and a block
/// segment. The split happens when fromA sits inside a top-level
/// textblock, for example a paragraph or a heading at doc level. The
/// inline segment covers the text, and the block segment covers the
/// remaining blocks.
///
/// Return null when the change needs no split. A change that stays
/// inside one boundary needs none. A fromA inside a nested textblock,
/// such as a list item paragraph, also needs none, because splitting it
/// would produce invalid DOM.
export function splitCrossBoundaryChange(
  doc: Node,
  newDoc: Node,
  change: MergedChange
): ChangeSegment[] | null {
  const $fromA = doc.resolve(change.fromA)

  // A split needs fromA inside a textblock and a depth-1 ancestor that
  // is also a textblock. Inside a list item or a blockquote the inline
  // segment would span block content, which puts a block element inside
  // a `<span>`.
  if (!$fromA.parent.isTextblock || $fromA.depth < 1) return null
  if (!$fromA.node(1).isTextblock) return null

  const blockEndA = $fromA.after(1)

  // The split point in newDoc is the first top-level block boundary at
  // or after fromB. An inline split needs fromB inside a top-level
  // textblock too. Otherwise the inline segment would hold block DOM,
  // such as a list or a blockquote, inside a `<span>`.
  const $fromB = newDoc.resolve(change.fromB)
  let splitB: number
  if ($fromB.depth >= 1 && $fromB.node(1).isTextblock) {
    splitB = $fromB.after(1)
    if (splitB > change.toB) splitB = change.toB
  } else {
    splitB = change.fromB
  }

  // A change that stays inside one block on both sides needs no split.
  if (blockEndA >= change.toA && splitB >= change.toB) return null

  const segments: ChangeSegment[] = []

  if (blockEndA > change.fromA || splitB > change.fromB) {
    segments.push({
      fromA: change.fromA,
      toA: Math.min(blockEndA, change.toA),
      fromB: change.fromB,
      toB: splitB,
      isBlock: false,
    })
  }

  // `Math.max` keeps fromA <= toA. A deletion that stays inside the
  // current textblock leaves no remainder on the old-doc side, while the
  // insertion continues into the following blocks.
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

/// Merge the changes that fall inside a custom block node into one
/// block-level change. A table, an image-block and a code block are
/// custom blocks. They render through a custom node view, which an
/// inline decoration cannot reach.
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

    // Expand a side to the enclosing top-level block only when that side
    // touches a custom block. For a pure insert or delete only the
    // ancestor check counts, so a boundary anchor next to a block does
    // not pull the block into the merge.
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

    // The union of the block range and the original change range keeps a
    // change that reaches past the block.
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

    // Coalesce with every emitted custom-block change that overlaps this
    // one, not only the first. Two seed changes can expand to the same
    // custom block, for example a deletion before a table and an
    // insertion after it, which would render the block twice. One seed
    // can also straddle two emitted custom blocks, and merging into only
    // the first would leave overlapping duplicates.
    const absorbedIndexes: number[] = []
    for (let k = 0; k < result.length; k++) {
      const prev = result[k]!
      if (!prev.isCustomBlock) continue
      const touchesA = overlaps(merged.fromA, merged.toA, prev.fromA, prev.toA)
      const touchesB = overlaps(merged.fromB, merged.toB, prev.fromB, prev.toB)
      if (!touchesA && !touchesB) continue
      merged.fromA = Math.min(merged.fromA, prev.fromA)
      merged.toA = Math.max(merged.toA, prev.toA)
      merged.fromB = Math.min(merged.fromB, prev.fromB)
      merged.toB = Math.max(merged.toB, prev.toB)
      absorbedIndexes.push(k)
    }
    for (let k = absorbedIndexes.length - 1; k >= 0; k--) {
      result.splice(absorbedIndexes[k]!, 1)
    }
    result.push(merged)
  }

  return result
}

/// Move a pure insert that sits at or past the run of trailing empty
/// paragraphs, so it anchors before the empty paragraph.
///
/// An editor such as Crepe always keeps an empty paragraph at the doc
/// end. An insert at `fromA === doc.content.size` lands after that
/// paragraph and pushes it out of the trailing slot. The next diff then
/// reads the empty paragraph as content to delete, and flashes an empty
/// removal widget.
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

/// Pick the top-level block range that encloses a custom block touched by
/// [from, to). Return null when neither endpoint touches a custom block. See
/// `touchesCustomBlockRange` for the touch rules.
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
