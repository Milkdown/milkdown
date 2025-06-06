import type { MarkType, NodeType } from '@milkdown/prose/model'

import { findNodeInSelection } from '@milkdown/prose'
import { $command } from '@milkdown/utils'

/// A command to check if a mark is selected.
export const isMarkSelectedCommand = $command('IsMarkSelected', () => {
  return (markType?: MarkType) => (state) => {
    if (!markType) return false
    const { doc, selection } = state
    const hasLink = doc.rangeHasMark(selection.from, selection.to, markType)
    return hasLink
  }
})

/// A command to check if a node is selected.
export const isNodeSelectedCommand = $command('IsNoteSelected', () => {
  return (nodeType?: NodeType) => (state) => {
    if (!nodeType) return false
    const result = findNodeInSelection(state, nodeType)
    return result.hasNode
  }
})
