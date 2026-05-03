import type { Ctx } from '@milkdown/kit/ctx'
import type { MilkdownError } from '@milkdown/kit/exception'
import type { StreamingConfig } from '@milkdown/kit/plugin/streaming'

import type { AISuggestionsBuilder } from './instruction-tooltip/suggestions'

export type {
  AISubmenuBuilder,
  AISubmenuDef,
  AISuggestionItem,
  AISuggestionsBuilder,
} from './instruction-tooltip/suggestions'

export interface AIPromptContext {
  document: string
  selection: string
  instruction: string
}

/// An async generator that yields markdown tokens from an LLM or
/// similar source. Called by `runAICmd` with the assembled prompt
/// context and an abort signal.
export type AIProvider = (
  context: AIPromptContext,
  signal: AbortSignal
) => AsyncIterable<string>

/// Diff-related config options passed through to the diff plugin and component.
export interface AIDiffConfig {
  acceptLabel?: string
  rejectLabel?: string
  customBlockTypes?: string[]
  ignoreAttrs?: Record<string, string[]>
}

/// Customize the inline streaming indicator pill shown while AI runs.
export interface AIStreamingIndicatorConfig {
  /// Fallback active-form label when the current session has none set
  /// (i.e., `runAICmd` was called without a `label`).
  /// @default DEFAULT_STREAMING_FALLBACK_LABEL
  fallbackLabel?: string

  /// Hint text shown after the label, suggesting how to cancel.
  /// @default DEFAULT_STREAMING_CANCEL_HINT
  cancelHint?: string
}

/// Customize the floating diff actions panel (Retry / Reject all / Accept all).
///
/// Note: the enter-key icon used in the Accept-all shortcut chip is
/// shared with the instruction tooltip and overridden via the top-level
/// `AIFeatureConfig.enterKeyIcon`.
export interface AIDiffActionsConfig {
  /// @default DEFAULT_DIFF_ACTIONS_RETRY_LABEL
  retryLabel?: string

  /// @default DEFAULT_DIFF_ACTIONS_REJECT_ALL_LABEL
  rejectAllLabel?: string

  /// @default DEFAULT_DIFF_ACTIONS_ACCEPT_ALL_LABEL
  acceptAllLabel?: string

  /// Icon for the Retry button. Default: refresh icon.
  retryIcon?: string

  /// Icon for the Reject all button. Default: 'X' icon.
  rejectIcon?: string

  /// Icon for the Accept all button. Default: checkmark icon.
  acceptIcon?: string

  /// Modifier key glyph shown alongside the enter-key icon. Set to
  /// 'Ctrl' on non-Mac platforms if you need to disambiguate.
  /// @default DEFAULT_DIFF_ACTIONS_MOD_SYMBOL
  modSymbol?: string
}

/// Configuration for `CrepeFeature.AI`.
export interface AIFeatureConfig {
  /// Async generator that yields markdown tokens. Required for
  /// `runAICmd`; without it the command returns false. The diff and
  /// streaming plugins load either way, so the feature can be enabled
  /// without a provider for diff-only or manual-streaming use cases.
  provider?: AIProvider

  /// Optional. Assemble the context passed to `provider`.
  /// Defaults to serializing the document (+ selection if any) as markdown.
  buildContext?: (ctx: Ctx, instruction: string) => AIPromptContext

  /// Whether to enter diff review after streaming completes. Default true.
  diffReviewOnEnd?: boolean

  /// Pass-through config for the diff plugin.
  diff?: AIDiffConfig

  /// Pass-through config for the streaming plugin.
  /// `diffReviewOnEnd` is excluded here because it's controlled by
  /// `AIFeatureConfig.diffReviewOnEnd` at the AI layer — setting it on
  /// both would be confusing.
  streaming?: Partial<Omit<StreamingConfig, 'diffReviewOnEnd'>>

  /// Called when an error occurs during AI processing.
  /// Receives a `MilkdownError` with code `aiProviderError` or
  /// `aiBuildContextError`.
  onError?: (error: MilkdownError) => void

  /// Custom icon for the AI toolbar button (sparkle entry point) and for
  /// the prefix slot inside the instruction input.
  aiIcon?: string

  /// Placeholder text for the AI instruction input on the main view.
  /// @default DEFAULT_INSTRUCTION_PLACEHOLDER
  instructionPlaceholder?: string

  /// Label for the suggestions section header.
  /// @default DEFAULT_SUGGESTIONS_HEADER_LABEL
  suggestionsHeaderLabel?: string

  /// Label for the free-text prompt section header.
  /// @default DEFAULT_SEND_AS_PROMPT_HEADER_LABEL
  sendAsPromptHeaderLabel?: string

  /// Prefix text for the free-text prompt entry, before the quoted input.
  /// @default DEFAULT_SEND_AS_PROMPT_LABEL
  sendAsPromptLabel?: string

  /// Icon for the round submit button in the input pill.
  /// Default: an upward arrow.
  sendIcon?: string

  /// Icon shown next to the "Ask AI: …" entry. Default: paper-plane.
  sendPromptIcon?: string

  /// Icon used in the keyboard shortcut chip on the prompt entry.
  /// Default: enter-key arrow.
  enterKeyIcon?: string

  /// Icon for the back arrow at the top of a submenu. Default: chevron-left.
  chevronLeftIcon?: string

  /// Icon shown on the right of submenu entries. Default: chevron-right.
  chevronRightIcon?: string

  /// Customize the suggestion list. The builder is pre-populated with the
  /// built-in suggestions; the callback can add, remove, or replace any
  /// item or submenu. To start from scratch, call `builder.clear()` first.
  buildAISuggestions?: (builder: AISuggestionsBuilder) => void

  /// Customize the inline streaming indicator pill shown while AI runs.
  streamingIndicator?: AIStreamingIndicatorConfig

  /// Customize the floating diff actions panel (Retry / Reject all /
  /// Accept all) that appears once streaming hands off to diff review.
  diffActions?: AIDiffActionsConfig
}

/// Options passed to `runAICmd`.
export interface RunAIOptions {
  /// The user instruction to send to the AI provider.
  instruction: string

  /// Optional active-form label shown in the streaming indicator
  /// (e.g., "Improving writing", "Translating"). When omitted, falls
  /// back to `streamingIndicator.fallbackLabel` (default `'Generating'`).
  label?: string
}
