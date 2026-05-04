import type { Ctx } from '@milkdown/kit/ctx'
import type { MilkdownError } from '@milkdown/kit/exception'

import { commandsCtx } from '@milkdown/kit/core'
import { aiBuildContextError, aiProviderError } from '@milkdown/kit/exception'
import { diffPluginKey } from '@milkdown/kit/plugin/diff'
import {
  abortStreamingCmd,
  endStreamingCmd,
  pushChunkCmd,
  startStreamingCmd,
  streamingPluginKey,
} from '@milkdown/kit/plugin/streaming'
import { $command, $ctx } from '@milkdown/kit/utils'

import type { AIProvider, AIPromptContext, RunAIOptions } from './types'

import { defaultBuildContext } from './context'

// ---------------------------------------------------------------------------
// Context slices
// ---------------------------------------------------------------------------

/// Holds the user-supplied provider and prompt builder. Populated by
/// the AI feature's setup function from `AIFeatureConfig`. `aiIcon`
/// lives here too so that other features (notably the toolbar) can pick
/// up the AI feature's icon override at render time.
export const aiProviderConfig = $ctx(
  {
    provider: undefined as AIProvider | undefined,
    buildContext: undefined as
      | ((ctx: Ctx, instruction: string) => AIPromptContext)
      | undefined,
    diffReviewOnEnd: true,
    onError: (error: MilkdownError) => {
      console.error(`[milkdown/ai] [${error.code}]`, error)
    },
    aiIcon: undefined as string | undefined,
  },
  'aiProviderConfig'
)

/// Holds the AbortController and active-form label for the current AI
/// session (null/empty when idle). `label` is shown in the streaming
/// indicator. `lastInstruction`, `lastLabel`, `lastFrom`, `lastTo` are
/// kept after the session ends so the diff-actions Retry button can
/// re-run the same prompt on the same text range. `diffOwnedByAI` is
/// flipped on right before our `endStreamingCmd` activates diff review
/// and back off when the diff panel sees the diff close, so a manually
/// started diff review (via `startDiffReviewCmd`) doesn't inherit the
/// previous AI session's Retry affordance.
export const aiSessionCtx = $ctx(
  {
    abortController: null as AbortController | null,
    label: '',
    lastInstruction: '',
    lastLabel: undefined as string | undefined,
    lastFrom: -1,
    lastTo: -1,
    diffOwnedByAI: false,
  },
  'aiSession'
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emitAIError(ctx: Ctx, error: MilkdownError): void {
  const config = ctx.get(aiProviderConfig.key)
  try {
    config.onError(error)
  } catch (handlerError) {
    console.error('[milkdown/ai] onError handler failed:', handlerError)
  }
}

/// Clear the live (`abortController`, `label`) portion of the session
/// while preserving the `last*` fields used by the diff-actions Retry
/// button.
function clearActiveSession(ctx: Ctx): void {
  const current = ctx.get(aiSessionCtx.key)
  ctx.set(aiSessionCtx.key, {
    ...current,
    abortController: null,
    label: '',
  })
}

// ---------------------------------------------------------------------------
// Async provider runner
// ---------------------------------------------------------------------------

async function runProvider(
  ctx: Ctx,
  provider: AIProvider,
  promptContext: AIPromptContext,
  abortController: AbortController
): Promise<void> {
  try {
    const iterable = provider(promptContext, abortController.signal)
    const commands = ctx.get(commandsCtx)
    for await (const chunk of iterable) {
      if (abortController.signal.aborted) break
      commands.call(pushChunkCmd.key, chunk)
    }
    if (abortController.signal.aborted) return
    // Streaming complete — hand off to diff review if configured. The
    // ownership flag is flipped *before* the dispatch so the diff-actions
    // panel reads `true` during the same transaction's update cycle.
    const config = ctx.get(aiProviderConfig.key)
    if (config.diffReviewOnEnd) {
      const cur = ctx.get(aiSessionCtx.key)
      ctx.set(aiSessionCtx.key, { ...cur, diffOwnedByAI: true })
    }
    commands.call(endStreamingCmd.key, {
      diffReview: config.diffReviewOnEnd,
    })
  } catch (error) {
    if (abortController.signal.aborted) return
    const milkdownError = aiProviderError(error)
    emitAIError(ctx, milkdownError)
    const commands = ctx.get(commandsCtx)
    commands.call(abortStreamingCmd.key, { keep: false })
  } finally {
    // Only clean up if this session is still the active one. If the
    // user aborted and immediately started a new session, the new
    // session owns the ctx now and we must not clobber it.
    const current = ctx.get(aiSessionCtx.key)
    if (current.abortController === abortController) {
      clearActiveSession(ctx)
    }
  }
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// Start an AI session: capture context, start streaming, and call the
/// provider asynchronously. The command returns synchronously; the
/// provider runs in the background.
///
/// When the user has a text selection, the streamed output replaces the
/// selected text. The provider also receives the selected text in
/// `AIPromptContext.selection` for context-aware generation.
export const runAICmd = $command('RunAI', (ctx) => {
  return (options?: RunAIOptions) => (state, dispatch) => {
    if (!options?.instruction) return false

    const config = ctx.get(aiProviderConfig.key)
    if (!config.provider) return false

    // Reject if a session is already running, streaming is active, or
    // diff review is active (the diff plugin blocks non-diff transactions,
    // so streaming flushes would be silently rejected).
    const session = ctx.get(aiSessionCtx.key)
    if (session.abortController) return false
    if (streamingPluginKey.getState(state)?.active) return false
    if (diffPluginKey.getState(state)?.active) return false

    // Dry-run: when dispatch is undefined, ProseMirror is probing
    // whether this command can execute. All precondition checks above
    // are side-effect-free so we can return true here.
    if (!dispatch) return true

    // Set the session label before starting the streaming plugin, so
    // the streaming-indicator widget reads the right label when its
    // decoration is first built. Empty string means "no caller-supplied
    // label" — the indicator widget falls through to its configured
    // `fallbackLabel`. `lastInstruction` / `lastLabel` are also stored
    // here so the diff-actions Retry button can re-run the same prompt
    // later.
    const abortController = new AbortController()
    const { from, to } = state.selection
    ctx.set(aiSessionCtx.key, {
      abortController,
      label: options.label ?? '',
      lastInstruction: options.instruction,
      lastLabel: options.label,
      lastFrom: from,
      lastTo: to,
      // Reset every run; only the success path that hands off to diff
      // review flips it back on.
      diffOwnedByAI: false,
    })

    // Start streaming — replaces the selection if non-empty.
    const commands = ctx.get(commandsCtx)
    const insertAt = state.selection.empty
      ? ('cursor' as const)
      : ('selection' as const)
    if (!commands.call(startStreamingCmd.key, { insertAt })) {
      clearActiveSession(ctx)
      return false
    }

    // Everything after startStreamingCmd is wrapped in try/catch: if
    // buildContext or anything else throws, we must abort the streaming
    // session to avoid leaving the editor locked with no way to recover.
    let promptContext: AIPromptContext
    try {
      const buildContext = config.buildContext ?? defaultBuildContext
      promptContext = buildContext(ctx, options.instruction)
    } catch (error) {
      const milkdownError = aiBuildContextError(error)
      emitAIError(ctx, milkdownError)
      commands.call(abortStreamingCmd.key, { keep: false })
      clearActiveSession(ctx)
      return false
    }

    // Fire-and-forget: the provider pushes chunks asynchronously.
    // startStreamingCmd already dispatched its own transaction — we
    // must NOT dispatch state.tr here as it would overwrite the
    // streaming plugin's state with a stale doc.
    void runProvider(ctx, config.provider, promptContext, abortController)

    return true
  }
})

/// Abort the current AI session. Signals the provider to stop and
/// delegates to `abortStreamingCmd` if streaming is still active.
/// Returns true whenever an AI session was actually cleaned up.
export const abortAICmd = $command('AbortAI', (ctx) => {
  return (options?: { keep?: boolean }) => (state, dispatch) => {
    const session = ctx.get(aiSessionCtx.key)
    // Dry-run: return whether there's something to abort, without
    // performing any side effects.
    if (!dispatch) return !!session.abortController

    if (!session.abortController) return false

    session.abortController.abort()
    clearActiveSession(ctx)

    // Only call abortStreamingCmd if the streaming plugin is still
    // active — it may have already finished/errored by the time the
    // user clicks abort.
    if (streamingPluginKey.getState(state)?.active) {
      const commands = ctx.get(commandsCtx)
      commands.call(abortStreamingCmd.key, options)
    }
    return true
  }
})
