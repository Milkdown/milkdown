import type { Node } from '@milkdown/prose/model'

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
}

/// Configuration options for the streaming plugin.
export interface StreamingConfig {
  /// Throttle interval for parse+diff+apply in ms (default: 100).
  throttleMs: number
  /// Lock editing during streaming (default: true).
  lockDuringStreaming: boolean
  /// Auto-scroll to follow streaming content (default: true).
  scrollFollow: boolean
  /// Enter diff review mode after streaming ends (default: false).
  diffReviewOnEnd: boolean
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
  | { type: 'start'; originalDoc: Node }
  | { type: 'push'; token: string }
  | { type: 'apply'; lastApplyTime: number }
  | { type: 'end' }
  | { type: 'abort' }
