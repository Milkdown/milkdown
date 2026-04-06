import type { Node, ResolvedPos } from '@milkdown/prose/model'

/// The streaming plugin state.
export interface StreamingState {
  /// The full accumulated markdown buffer.
  buffer: string
  /// Snapshot of the editor doc before streaming started.
  originalDoc: Node
  /// Whether streaming is actively receiving tokens.
  active: boolean
  /// Timestamp of last apply cycle (for throttle tracking).
  lastApplyTime: number
  /// Insert position in the original doc (null = replace-whole-doc mode).
  insertPos: number | null
  /// End position of inserted content after last flush (for tracking).
  insertEndPos: number | null
}

/// Strategy for inserting streamed content at a given cursor position.
export type InsertStrategy =
  /// Insert buffer as plain text. `preserveNewlines` controls whether
  /// newlines are kept (code blocks) or collapsed to spaces (table cells).
  | { type: 'plain-text'; preserveNewlines?: boolean }
  /// First line merges as text into the current block; remaining lines
  /// are parsed as markdown and inserted as blocks after the enclosing
  /// top-level ancestor. Works for paragraphs, headings, list items,
  /// blockquotes, etc.
  | { type: 'split-block' }
  /// Parse the entire buffer as markdown and insert as top-level blocks.
  /// Used when the cursor is between blocks (depth 0).
  | { type: 'block' }

/// A resolver that determines the insert strategy based on the cursor position.
/// Return an `InsertStrategy` to control how streamed content is inserted.
export type InsertStrategyResolver = (resolved: ResolvedPos) => InsertStrategy

/// Configuration options for the streaming plugin.
export interface StreamingConfig {
  /// Throttle interval for parse+diff+apply in ms (default: 100).
  throttleMs: number
  /// Lock editing during streaming (default: true).
  /// When disabled, concurrent edits are allowed but abort/diff-review
  /// will restore the original document snapshot, discarding those edits.
  lockDuringStreaming: boolean
  /// Auto-scroll to follow streaming content (default: true).
  scrollFollow: boolean
  /// Enter diff review mode after streaming ends (default: false).
  diffReviewOnEnd: boolean
  /// Map of node type names to attribute keys to ignore when diffing
  /// during streaming flush (e.g. `{ heading: ['id'] }`).
  ignoreAttrs?: Record<string, string[]>
  /// Custom resolver for determining how streamed content is inserted
  /// based on cursor position. When not set, uses `defaultInsertStrategy`.
  insertStrategy?: InsertStrategyResolver
}

/// Options for starting a streaming session.
export interface StartStreamingOptions {
  /// Insert at cursor position or a specific position instead of replacing
  /// the whole document. 'cursor' resolves to current selection head.
  insertAt?: 'cursor' | number
}

/// Options for ending a streaming session.
export interface EndStreamingOptions {
  /// Override the default diffReviewOnEnd config.
  diffReview?: boolean
}

/// Options for aborting a streaming session.
export interface AbortStreamingOptions {
  /// If true, keep the partial content. If false, restore original doc (default: false).
  keep?: boolean
}

/// Actions that can be dispatched to the streaming plugin.
export type StreamingAction =
  | {
      type: 'start'
      originalDoc: Node
      insertPos?: number
      insertEndPos?: number
      lastApplyTime: number
    }
  | { type: 'push'; token: string }
  | { type: 'apply'; lastApplyTime: number; insertEndPos?: number }
  | { type: 'end' }
  | { type: 'abort' }
