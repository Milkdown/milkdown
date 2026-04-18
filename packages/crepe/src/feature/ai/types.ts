import type { Ctx } from '@milkdown/kit/ctx'
import type { MilkdownError } from '@milkdown/kit/exception'
import type { StreamingConfig } from '@milkdown/kit/plugin/streaming'

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
}

/// Options passed to `runAICmd`.
export interface RunAIOptions {
  /// The user instruction to send to the AI provider.
  instruction: string
}
