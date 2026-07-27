import type { Node as ProseNode } from '../../model'
import type { EditorState } from '../../state'

export const CARET_MARKER = '┃'
export const RANGE_OPEN_MARKER = '❰'
export const RANGE_CLOSE_MARKER = '❱'

export interface TextIndexOptions {
  blockSeparator?: string
  leafText?: string
}

interface Emission {
  text: string
  kind: 'text' | 'leaf' | 'separator'
  /// Doc range covered by the emitted text. For separators the range is
  /// empty and anchored at the position of the block node they precede.
  from: number
  to: number
}

function walkText(doc: ProseNode, options?: TextIndexOptions): Emission[] {
  const { blockSeparator = '\n', leafText = '□' } = options ?? {}
  const emissions: Emission[] = []
  let firstBlock = true

  const pushSeparator = (pos: number) => {
    if (firstBlock) {
      firstBlock = false
      return
    }
    emissions.push({
      text: blockSeparator,
      kind: 'separator',
      from: pos,
      to: pos,
    })
  }

  doc.descendants((node, pos) => {
    if (node.isText) {
      emissions.push({
        text: node.text ?? '',
        kind: 'text',
        from: pos,
        to: pos + node.nodeSize,
      })
      return false
    }
    if (node.isInline && node.isLeaf) {
      emissions.push({
        text: leafText,
        kind: 'leaf',
        from: pos,
        to: pos + node.nodeSize,
      })
      return false
    }
    if (node.isTextblock) {
      pushSeparator(pos)
      return true
    }
    if (node.isLeaf) {
      pushSeparator(pos)
      emissions.push({
        text: leafText,
        kind: 'leaf',
        from: pos,
        to: pos + node.nodeSize,
      })
      return false
    }
    return true
  })

  return emissions
}

/// Map a document position to an offset in the flattened text produced by
/// `getSelectionSnapshot` (without markers).
export function posToTextOffset(
  doc: ProseNode,
  pos: number,
  options?: TextIndexOptions
): number {
  let offset = 0
  for (const emission of walkText(doc, options)) {
    if (emission.kind === 'text' || emission.kind === 'leaf') {
      if (pos < emission.from) return offset
      if (pos <= emission.to) {
        if (emission.kind === 'leaf')
          return pos <= emission.from ? offset : offset + emission.text.length
        return offset + (pos - emission.from)
      }
    } else if (pos <= emission.from) {
      return offset
    }
    offset += emission.text.length
  }
  return offset
}

/// Map an offset in the flattened text back to a document position. Offsets
/// pointing at a block separator resolve to the end of the previous block;
/// offsets inside a leaf placeholder resolve to the position before the leaf.
export function textOffsetToPos(
  doc: ProseNode,
  offset: number,
  options?: TextIndexOptions
): number {
  let current = 0
  let lastPos = 0
  for (const emission of walkText(doc, options)) {
    const end = current + emission.text.length
    if (offset < end || (offset === end && emission.kind === 'text')) {
      if (emission.kind === 'text') return emission.from + (offset - current)
      if (emission.kind === 'leaf') return emission.from
      return emission.from - 1
    }
    current = end
    lastPos = emission.to
  }
  return lastPos
}

/// Render the document text with the selection drawn in: `┃` for a caret,
/// `❰…❱` for a range. Blocks are joined with `blockSeparator` and leaf nodes
/// render as `leafText`. Made for inline snapshot assertions in tests.
export function getSelectionSnapshot(
  state: EditorState,
  options?: TextIndexOptions
): string {
  const { doc, selection } = state
  const text = walkText(doc, options)
    .map((emission) => emission.text)
    .join('')

  if (selection.empty) {
    const index = posToTextOffset(doc, selection.head, options)
    return `${text.slice(0, index)}${CARET_MARKER}${text.slice(index)}`
  }

  const from = posToTextOffset(doc, selection.from, options)
  const to = posToTextOffset(doc, selection.to, options)
  return `${text.slice(0, from)}${RANGE_OPEN_MARKER}${text.slice(
    from,
    to
  )}${RANGE_CLOSE_MARKER}${text.slice(to)}`
}
