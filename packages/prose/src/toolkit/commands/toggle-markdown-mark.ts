/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType } from '../../model'
import { AllSelection } from '../../state'
import type { Command, TextSelection } from '../../state'

export const toggleMarkdownMark = (markType: MarkType, mark: string): Command => {
  return (state, dispatch) => {
    const { tr, selection } = state
    const { from, to, $cursor, ranges } = selection as TextSelection
    const cursorMarks = $cursor?.marks() ?? []
    if ($cursor) {
      if (markType.isInSet(state.storedMarks || cursorMarks)) {
        dispatch?.(tr.removeStoredMark(markType))
        return true
      }
      dispatch?.(tr.addStoredMark(markType.create()))
      return true
    }
    let has = false
    for (let i = 0; !has && i < ranges.length; i++) {
      const { $from, $to } = ranges[i]!
      has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
    }
    if (has) {
      for (let i = 0; i < ranges.length; i++) {
        const { $from, $to } = ranges[i]!
        tr.removeMark($from.pos, $to.pos, markType)
      }
      dispatch?.(tr.scrollIntoView())
      return true
    }

    if (selection instanceof AllSelection)
      return false

    dispatch?.(tr.insertText(mark, from).insertText(mark, to + mark.length).scrollIntoView())
    return true
  }
}
