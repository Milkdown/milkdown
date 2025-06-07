import { findNodeInSelection } from '@milkdown/prose'
import {
  Node,
  type Attrs,
  type MarkType,
  type NodeType,
} from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import { findWrapping } from '@milkdown/prose/transform'
import { $command } from '@milkdown/utils'

/// A command to check if a mark is selected.
export const isMarkSelectedCommand = $command(
  'IsMarkSelected',
  () => (markType?: MarkType) => (state) => {
    if (!markType) return false
    const { doc, selection } = state
    const hasLink = doc.rangeHasMark(selection.from, selection.to, markType)
    return hasLink
  }
)

/// A command to check if a node is selected.
export const isNodeSelectedCommand = $command(
  'IsNoteSelected',
  () => (nodeType?: NodeType) => (state) => {
    if (!nodeType) return false
    const result = findNodeInSelection(state, nodeType)
    return result.hasNode
  }
)

/// A command to clear text in the current block.
export const clearTextInCurrentBlockCommand = $command(
  'ClearTextInCurrentBlock',
  () => () => (state, dispatch) => {
    let tr = state.tr
    const { $from, $to } = tr.selection
    const { pos: from } = $from
    const { pos: right } = $to
    const left = from - $from.node().content.size
    if (left < 0) return false

    tr = tr.deleteRange(left, right)
    dispatch?.(tr)
    return true
  }
)

/// Set block type to target block and attribute.
export const setBlockTypeCommand = $command(
  'SetBlockType',
  () =>
    (payload?: { nodeType: NodeType; attrs?: Attrs | null }) =>
    (state, dispatch) => {
      const { nodeType, attrs = null } = payload ?? {}
      if (!nodeType) return false
      const tr = state.tr
      const { from, to } = tr.selection
      try {
        tr.setBlockType(from, to, nodeType, attrs)
      } catch {
        return false
      }
      dispatch?.(tr)
      return true
    }
)

/// A command to wrap the current block with a block type.
export const wrapInBlockTypeCommand = $command(
  'WrapInBlockType',
  () =>
    (payload?: { nodeType: NodeType; attrs?: Attrs | null }) =>
    (state, dispatch) => {
      const { nodeType, attrs = null } = payload ?? {}
      if (!nodeType) return false

      let tr = state.tr

      try {
        const { $from, $to } = tr.selection
        const blockRange = $from.blockRange($to)
        const wrapping = blockRange && findWrapping(blockRange, nodeType, attrs)
        if (!wrapping) return false
        tr = tr.wrap(blockRange, wrapping)
      } catch {
        return false
      }

      dispatch?.(tr)
      return true
    }
)

/// A command to add a block type to the current selection.
export const addBlockTypeCommand = $command(
  'AddBlockType',
  () =>
    (payload?: { nodeType: NodeType | Node; attrs?: Attrs | null }) =>
    (state, dispatch) => {
      const { nodeType, attrs = null } = payload ?? {}
      if (!nodeType) return false
      const tr = state.tr

      try {
        const node =
          nodeType instanceof Node ? nodeType : nodeType.createAndFill(attrs)
        if (!node) return false

        tr.replaceSelectionWith(node)
      } catch {
        return false
      }
      dispatch?.(tr)
      return true
    }
)

/// A command to select text near a position.
export const selectTextNearPosCommand = $command(
  'SelectTextNearPos',
  () => (payload?: { pos?: number }) => (state, dispatch) => {
    const { pos } = payload ?? {}
    if (pos == null) return false

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max)

    const tr = state.tr
    try {
      const $pos = state.doc.resolve(clamp(pos, 0, state.doc.content.size))
      tr.setSelection(TextSelection.near($pos))
    } catch {
      return false
    }
    dispatch?.(tr.scrollIntoView())
    return true
  }
)
