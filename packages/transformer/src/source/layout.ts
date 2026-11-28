import type { MarkdownNode } from '../utility'
import type { DetachedSource, SourceBlock, SourceLayout } from './source'

import { detachedSourceOf } from './detached'

interface Range {
  from: number
  to: number
}

const rangeOf = (node: MarkdownNode): Range | null => {
  const from = node.position?.start.offset
  const to = node.position?.end.offset
  return from == null || to == null ? null : { from, to }
}

const isBlank = (text: string) => text.trim() === ''

// A position starts after the indentation of its first line. Move the
// start back over that indentation, so the text of the range has it.
const lineStart = (text: string, offset: number, min: number) => {
  let start = offset
  while (start > min && (text[start - 1] === ' ' || text[start - 1] === '\t'))
    start--
  const atLineStart =
    start === 0 || text[start - 1] === '\n' || text[start - 1] === '\r'
  return atLineStart ? start : offset
}

/// @internal
/// Find where each top-level node of `tree` is in `text`. `tree` is the
/// tree after the remark plugins ran. `shift` is added to every offset.
export function layoutOf(
  text: string,
  tree: MarkdownNode,
  shift: number
): SourceLayout {
  const unknown: SourceLayout = { blocks: null, detached: [] }
  const ranges: Range[] = []
  let end = 0

  for (const node of tree.children ?? []) {
    const range = rangeOf(node)
    // The plugins must keep the nodes in the order of the text.
    if (!range || range.from < end || range.to < range.from) return unknown

    ranges.push({ from: lineStart(text, range.from, end), to: range.to })
    end = range.to
  }

  const record = detachedSourceOf(tree)
  const pieces = [...record.detached].sort((a, b) => a.from - b.from)
  const uses = [...record.uses].sort((a, b) => a.offset - b.offset)

  // Between two blocks there may be blank text, and text that a plugin
  // said it took out of the tree. Anything else is text that no node
  // stands for, and it would get lost.
  const detached: DetachedSource[] = []
  let next = 0
  const isGap = (from: number, to: number) => {
    let pos = from
    while (next < pieces.length) {
      const piece = pieces[next]!
      if (piece.from >= to) break
      // A piece that is not in a gap is inside a block, and it is part
      // of the text of that block.
      if (piece.from >= pos && piece.to <= to) {
        if (!isBlank(text.slice(pos, piece.from))) return false
        detached.push({ ...piece, from: lineStart(text, piece.from, pos) })
        pos = piece.to
      }
      next++
    }
    return isBlank(text.slice(pos, to))
  }

  let pos = 0
  for (const range of ranges) {
    if (!isGap(pos, range.from)) return unknown
    pos = range.to
  }
  if (!isGap(pos, text.length)) return unknown

  // The uses are in the order of the text, and so are the blocks.
  let at = 0
  const blocks: SourceBlock[] = ranges.map(({ from, to }) => {
    const requires: string[] = []
    while (at < uses.length && uses[at]!.offset < from) at++
    while (at < uses.length && uses[at]!.offset < to)
      requires.push(uses[at++]!.id)

    return { from: from + shift, to: to + shift, requires }
  })

  return {
    blocks,
    detached: detached.map((piece) => ({
      ...piece,
      from: piece.from + shift,
      to: piece.to + shift,
    })),
  }
}
