import { InputRule } from '../../inputrules'
import type { Mark, MarkType } from '../../model'
import type { Captured, Options } from './common'

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

    let markEnd = end

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
