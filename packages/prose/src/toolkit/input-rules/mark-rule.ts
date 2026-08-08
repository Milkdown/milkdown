import type { Mark, MarkType } from '../../model'
import type { EditorState } from '../../state'
import type { Captured, Options } from './common'

import { InputRule } from '../../inputrules'

// `MarkSpec.code` declares that the content of a span is literal.
// `prosemirror-inputrules` keys its own `inCodeMark` barrier off the same flag.
function hasCodeMark(marks: readonly Mark[]) {
  return marks.some((mark) => mark.type.spec.code)
}

function rangeHasCodeMark(state: EditorState, from: number, to: number) {
  // `nodesBetween` on an empty range still visits the node containing the
  // position, which would report a code mark that the range does not cover.
  if (from >= to) return false

  let found = false
  state.doc.nodesBetween(from, to, (node) => {
    if (node.isInline && hasCodeMark(node.marks)) found = true
    return !found
  })
  return found
}

// A code mark is inclusive, so text typed right after a code span inherits it.
// Such text only belongs to the code span when the span continues after it.
function codeSpanContinuesAfter(state: EditorState, pos: number) {
  const { nodeAfter } = state.doc.resolve(pos)
  return !!nodeAfter && hasCodeMark(nodeAfter.marks)
}

function delimiterInCodeSpan(state: EditorState, from: number, to: number) {
  return rangeHasCodeMark(state, from, to) && codeSpanContinuesAfter(state, to)
}

function typedCharInCodeSpan(state: EditorState, pos: number) {
  const marks = state.storedMarks ?? state.doc.resolve(pos).marks()
  return hasCodeMark(marks) && codeSpanContinuesAfter(state, pos)
}

/// Create an input rule for a mark.
export function markRule(
  regexp: RegExp,
  markType: MarkType,
  options: Options = {}
): InputRule {
  return new InputRule(regexp, (state, match, start, end) => {
    const { tr } = state
    const matchLength = match.length

    let group = match[matchLength - 1]
    let fullMatch = match[0]
    let initialStoredMarks: readonly Mark[] = []

    let markEnd: number

    const captured: Captured = {
      group,
      fullMatch,
      start,
      end,
    }

    const result = options.updateCaptured?.(captured)
    Object.assign(captured, result)
    ;({ group, fullMatch, start, end } = captured)

    if (fullMatch === null) return null

    if (group?.trim() === '') return null

    if (group) {
      const startSpaces = fullMatch.search(/\S/)
      const textStart = start + fullMatch.indexOf(group)
      const textEnd = textStart + group.length

      // Delimiters inside inline code are literal, but an inline code mark can
      // still be valid content inside an outer mark such as *`code`*.
      const openingDelimiterInCodeSpan = delimiterInCodeSpan(
        state,
        start + startSpaces,
        textStart
      )
      const closingDelimiterInCodeSpan =
        textEnd < end && delimiterInCodeSpan(state, textEnd, end)
      if (
        openingDelimiterInCodeSpan ||
        closingDelimiterInCodeSpan ||
        typedCharInCodeSpan(state, end)
      )
        return null

      initialStoredMarks = tr.storedMarks ?? []

      if (textEnd < end) tr.delete(textEnd, end)

      if (textStart > start) tr.delete(start + startSpaces, textStart)

      markEnd = start + startSpaces + group.length

      const attrs = options.getAttr?.(match)

      tr.addMark(start, markEnd, markType.create(attrs))
      tr.setStoredMarks(initialStoredMarks)

      options.beforeDispatch?.({ match, start, end, tr })
    }

    return tr
  })
}
