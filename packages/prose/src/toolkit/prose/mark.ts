import type { Mark, MarkType, ResolvedPos } from '../../model'

export interface MarkRange {
  mark: Mark
  from: number
  to: number
}

/// Find the extent of a mark of the given type around a resolved position.
///
/// The lookup is boundary-inclusive on both edges: a caret sitting right
/// before or right after a marked run still resolves to it. When marked runs
/// touch the position on both sides, the run after the position wins.
///
/// The run is extended by mark equality (`Mark.eq`, type + attrs), so two
/// adjacent links with different hrefs resolve as two separate ranges.
export function getMarkRange(
  $pos: ResolvedPos,
  type: MarkType
): MarkRange | undefined {
  const parent = $pos.parent

  let cursor = parent.childAfter($pos.parentOffset)
  if (!cursor.node || !type.isInSet(cursor.node.marks))
    cursor = parent.childBefore($pos.parentOffset)
  if (!cursor.node) return undefined

  const mark = type.isInSet(cursor.node.marks)
  if (!mark) return undefined

  let index = cursor.index
  let from = $pos.start() + cursor.offset
  let to = from + cursor.node.nodeSize

  while (index > 0 && mark.isInSet(parent.child(index - 1).marks)) {
    index -= 1
    from -= parent.child(index).nodeSize
  }

  let endIndex = cursor.index + 1
  while (
    endIndex < parent.childCount &&
    mark.isInSet(parent.child(endIndex).marks)
  ) {
    to += parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return { mark, from, to }
}
