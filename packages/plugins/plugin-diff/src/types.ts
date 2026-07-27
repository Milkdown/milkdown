import type { Change } from '@milkdown/prose/changeset'
import type { Node } from '@milkdown/prose/model'

/// The diff plugin state.
export interface DiffState {
  /** The target (new) document that we're diffing toward */
  newDoc: Node
  /** Current changes between current doc and newDoc (recomputed on doc change) */
  changes: readonly Change[]
  /** Ranges in newDoc that have been rejected (fromB..toB).
   *  These are stable because newDoc never changes. */
  rejectedRanges: Array<{ fromB: number; toB: number }>
  /** Whether the diff review is currently active */
  active: boolean
}

/// Configuration options for the diff plugin.
export interface DiffConfig {
  /** Map of node type names to attribute keys to ignore when diffing */
  ignoreAttrs: Record<string, string[]>
}

/// A position range in both old and new documents.
export interface DiffRange {
  fromA: number
  toA: number
  fromB: number
  toB: number
}

/// Actions that can be dispatched to the diff plugin.
export type DiffAction =
  | { type: 'start'; newDoc: Node }
  | { type: 'accept'; changeIndex: number }
  | { type: 'reject'; fromB: number; toB: number }
  | { type: 'acceptRange'; range: DiffRange }
  | { type: 'rejectRange'; range: DiffRange }
  | { type: 'acceptAll' }
  | { type: 'clear' }
