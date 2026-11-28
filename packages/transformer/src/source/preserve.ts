import type { SerializedSegments } from '../serializer/segments'
import type { DetachedSource, SourceBlock } from './source'

/// The options of `preserveSource`.
export interface PreserveSourceOptions {
  /// The markdown text that the document was loaded from.
  source: string
  /// Where each top-level block of the loaded document is in `source`.
  blocks: readonly SourceBlock[]
  /// The pieces of `source` that have no node in the loaded document.
  detached: readonly DetachedSource[]
  /// The offset in `source` after its last block or detached piece. The text
  /// from there on ends the result.
  tail: number
  /// What the serializer writes for each block of the loaded document on
  /// its own: `SerializedSegments.keys` of that document.
  keys: readonly string[]
  /// What the serializer writes for the document as it is now.
  current: SerializedSegments
  /// Tell which block of the loaded document is the very same node as
  /// block `index` of the document as it is now, if any.
  sameBlock?: (index: number) => number | undefined
  /// Check a result before it is used. `reused` has one entry for each
  /// block of the document as it is now: the index of the block of the
  /// loaded document whose text was taken, or `null` for a block that was
  /// serialized. A check parses `markdown` and makes sure that each reused
  /// text still gives the node it gave in `source`.
  verify: (markdown: string, reused: readonly (number | null)[]) => boolean
}

interface Item {
  from: number
  to: number
  /// The index of the block, for a block.
  block?: number
  /// The id of the piece, for a detached piece.
  id?: string
}

interface Piece {
  text: string
  /// The position in the items of the source, for text taken from it.
  item?: number
  /// The index of the block in the document as it is now.
  current?: number
  /// The index of the block of the loaded document, for a reused block.
  reused?: number
}

/// Write the markdown of a document so that every block that still has
/// the content it was loaded with keeps the text it had in the source.
/// Only the blocks that changed are written by the serializer.
///
/// It returns `null` when it has nothing to keep, or when no result passes
/// `verify`. Use what the serializer wrote in that case.
///
/// A block keeps its text when it serializes to the same text as a block
/// of the loaded document. The blank lines between two blocks stay as
/// they were when both blocks are kept and they were next to each other.
/// A detached piece of the source stays as long as a kept block needs it.
export function preserveSource({
  source,
  blocks,
  detached,
  tail,
  keys,
  current,
  sameBlock,
  verify,
}: PreserveSourceOptions): string | null {
  if (blocks.length !== keys.length) return null

  const eol = source.includes('\r\n') ? '\r\n' : '\n'
  // The serializer writes `\n`. Follow the line endings of the source.
  const fresh = (text: string) =>
    eol === '\n' ? text : text.replace(/\r?\n/g, eol)

  const items: Item[] = [
    ...blocks.map(({ from, to }, block) => ({ from, to, block })),
    ...detached.map(({ from, to, id }) => ({ from, to, id })),
  ].sort((a, b) => a.from - b.from)
  const itemOfBlock: number[] = []
  items.forEach((item, position) => {
    if (item.block != null) itemOfBlock[item.block] = position
  })
  const everRequired = new Set(blocks.flatMap((block) => block.requires))

  const assemble = (reuse: readonly (number | null)[]) => {
    const reusedBlocks = new Set(reuse.filter((index) => index != null))
    const required = new Set(
      [...reusedBlocks].flatMap((index) => blocks[index]!.requires)
    )
    const isReused = (item: Item | undefined) =>
      item?.block != null && reusedBlocks.has(item.block)
    // The nearest block before or after a position, for every block or
    // only for the reused ones.
    const findBlock = (from: number, step: 1 | -1, reusedOnly: boolean) => {
      for (let at = from + step; at >= 0 && at < items.length; at += step) {
        const item = items[at]!
        if (item.block == null) continue
        if (!reusedOnly || isReused(item)) return item
      }
      return undefined
    }

    // A detached piece stays when a reused block needs it. A piece that
    // no block ever needed stays next to the block it was next to. Any
    // other piece goes: the blocks that needed it were serialized, and
    // what the serializer writes for a block needs nothing outside of it.
    const before = new Map<number, number[]>()
    const after = new Map<number, number[]>()
    items.forEach((item, position) => {
      if (item.id == null) return

      const keep =
        required.has(item.id) ||
        (!everRequired.has(item.id) &&
          (isReused(findBlock(position, -1, false)) ||
            isReused(findBlock(position, 1, false))))
      if (!keep) return

      const previous = findBlock(position, -1, true)
      const anchors = previous ? after : before
      const anchor = previous ?? findBlock(position, 1, true)
      if (anchor?.block == null) return
      anchors.set(anchor.block, [
        ...(anchors.get(anchor.block) ?? []),
        position,
      ])
    })

    const pieces: Piece[] = []
    const take = (position: number): Piece => {
      const { from, to } = items[position]!
      return { text: source.slice(from, to), item: position }
    }
    reuse.forEach((index, block) => {
      if (index == null) {
        pieces.push({ text: fresh(current.texts[block]!), current: block })
        return
      }
      before.get(index)?.forEach((position) => pieces.push(take(position)))
      pieces.push({
        ...take(itemOfBlock[index]!),
        current: block,
        reused: index,
      })
      after.get(index)?.forEach((position) => pieces.push(take(position)))
    })

    // Two pieces that were next to each other in the source keep what was
    // between them.
    const wereNeighbors = (left: Piece, right: Piece) =>
      left.item != null && right.item === left.item + 1
    const separate = (left: Piece, right: Piece) => {
      if (wereNeighbors(left, right))
        return source.slice(items[left.item!]!.to, items[right.item!]!.from)
      if (left.current != null && right.current === left.current + 1)
        return fresh(current.separators[left.current] ?? '\n\n')
      return eol + eol
    }

    let markdown = source.slice(0, items[0]!.from)
    // A reused block is at a seam when a neighbor is not the one it had.
    const seams: number[] = []
    pieces.forEach((piece, at) => {
      const left = pieces[at - 1]
      const right = pieces[at + 1]
      if (left) markdown += separate(left, piece)
      markdown += piece.text
      if (
        piece.reused != null &&
        ((left && !wereNeighbors(left, piece)) ||
          (right && !wereNeighbors(piece, right)))
      )
        seams.push(piece.current!)
    })
    markdown += source.slice(tail)

    const reused = pieces
      .filter((piece) => piece.current != null)
      .map((piece) => piece.reused ?? null)

    return { markdown, reused, seams }
  }

  let reuse = matchBlocks(keys, current.keys, sameBlock)
  for (let attempt = 0; attempt < 2; attempt++) {
    if (!reuse.some((index) => index != null)) return null

    const { markdown, reused, seams } = assemble(reuse)
    if (markdown === current.full || verify(markdown, reused)) return markdown

    // A reused text can read differently next to a new neighbor: two
    // lists with the same marker merge, an open code fence swallows what
    // follows. Serialize the blocks at the seams and try once more.
    if (seams.length === 0) return null
    reuse = reuse.map((index, block) => (seams.includes(block) ? null : index))
  }

  return null
}

/// Find for each block of the document as it is now a block of the loaded
/// document that serializes to the same text. Each loaded block is used
/// once.
function matchBlocks(
  keys: readonly string[],
  currentKeys: readonly string[],
  sameBlock?: (index: number) => number | undefined
): (number | null)[] {
  const reuse: (number | null)[] = currentKeys.map(() => null)
  const used = new Set<number>()

  // A block that was never touched is still the same node. Match those
  // first, so two blocks with the same text do not swap their sources.
  currentKeys.forEach((key, block) => {
    const index = sameBlock?.(block)
    if (index == null || used.has(index) || keys[index] !== key) return
    reuse[block] = index
    used.add(index)
  })

  const byKey = new Map<string, number[]>()
  keys.forEach((key, index) => {
    if (used.has(index)) return
    byKey.set(key, [...(byKey.get(key) ?? []), index])
  })

  // Among the blocks with the same text, prefer the next one in the order
  // of the source. Blocks that keep their order keep what is between them.
  let last = -1
  currentKeys.forEach((key, block) => {
    const matched = reuse[block]
    if (matched != null) {
      last = matched
      return
    }

    const candidates = byKey.get(key)
    if (!candidates?.length) return

    const next = candidates.findIndex((index) => index > last)
    const [index] = candidates.splice(Math.max(next, 0), 1)
    reuse[block] = index!
    last = index!
  })

  return reuse
}
