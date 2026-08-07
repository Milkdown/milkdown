import type { Mark, MarkType } from '../../model'
import type { EditorState } from '../../state'
import type { Captured, Options } from './common'

import { InputRule } from '../../inputrules'

function rangeHasCodeMark(state: EditorState, from: number, to: number) {
  let found = false
  state.doc.nodesBetween(from, to, (node) => {
    if (node.isInline && node.marks.some((mark) => mark.type.spec.code))
      found = true
  })
  return found
}

function inputHasCodeMark(state: EditorState, pos: number) {
  const marks = state.storedMarks ?? state.doc.resolve(pos).marks()
  return marks.some((mark) => mark.type.spec.code)
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
      const openingDelimiterHasCodeMark = rangeHasCodeMark(
        state,
        start + startSpaces,
        textStart
      )
      const closingDelimiterHasCodeMark =
        textEnd < end && rangeHasCodeMark(state, textEnd, end)
      if (
        openingDelimiterHasCodeMark ||
        closingDelimiterHasCodeMark ||
        inputHasCodeMark(state, end)
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
