import type { Node, ResolvedPos } from '@milkdown/prose/model'

/// @internal
export interface CellPos {
  pos: number
  start: number
  node: Node
}

/// @internal
export type CellSelectionRange = {
  $anchor: ResolvedPos
  $head: ResolvedPos
  // an array of column/row indexes
  indexes: number[]
}
