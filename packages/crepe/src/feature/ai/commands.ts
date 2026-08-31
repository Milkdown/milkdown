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

/// The resolved AI configuration held by the `aiProviderConfig` slice.
/// Read it with `useAIProviderConfig`.
///
/// ⚠️ In BYOK deployments `provider` is a closure over the user's API key,
/// so don't log or serialize this object wholesale.
export interface AIProviderConfigValue {
  provider: AIProvider | undefined
  buildContext: ((ctx: Ctx, instruction: string) => AIPromptContext) | undefined
  diffReviewOnEnd: boolean
  onError: (error: MilkdownError) => void
  aiIcon: string | undefined
}

/// Holds the user-supplied provider and prompt builder. Populated by
/// the AI feature's setup function from `AIFeatureConfig`. `aiIcon`
/// lives here too so that other features (notably the toolbar) can pick
/// up the AI feature's icon override at render time.
export const aiProviderConfig = $ctx<AIProviderConfigValue, 'aiProviderConfig'>(
  {
    provider: undefined,
    buildContext: undefined,
    diffReviewOnEnd: true,
    onError: (error: MilkdownError) => {
      console.error(`[milkdown/ai] [${error.code}]`, error)
    },
    aiIcon: undefined,
  },
  'aiProviderConfig'
)

/// Read the AI configuration. The most useful field is `provider`, which
/// stays `undefined` until the host configures one. A custom toolbar
/// hides its AI entry while the field is unset, because the palette
/// would open and every action would be rejected.
///
/// Throws if the AI feature is disabled, so gate the call on
/// `useCrepeFeatures(ctx).get().includes(CrepeFeature.AI)`.
///
/// ```ts
/// import { useAIProviderConfig } from '@milkdown/crepe/feature/ai'
/// const hasProvider = crepe.editor.action(
///   (ctx) => !!useAIProviderConfig(ctx).provider
/// )
/// ```
export function useAIProviderConfig(ctx: Ctx) {
  // String slice, not `aiProviderConfig.key`: every package entry is
  // bundled on its own, so a host importing `Crepe` from the root and this
  // helper from `./feature/ai` holds two distinct slice objects. Name-based
  // lookup is the only one that survives that. Same reasoning as
  // `useCrepe` in `core/slice.ts`.
  return ctx.get<AIProviderConfigValue, 'aiProviderConfig'>('aiProviderConfig')
}

/// Holds the AbortController and active-form label for the current AI
/// session (null/empty when idle). `label` is shown in the streaming
/// indicator. `lastInstruction`, `lastLabel`, `lastFrom`, `lastTo` are
/// kept after the session ends so the diff-actions Retry button can
/// re-run the same prompt on the same text range. `diffOwnedByAI` is
/// turned on right before `endStreamingCmd` activates diff review, and
/// turned off when the diff panel sees the diff close. A diff review
/// that `startDiffReviewCmd` starts by hand then inherits no Retry
/// affordance from the previous AI session.
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
    // Streaming is complete, so hand off to diff review when the config
    // asks for it. The ownership flag flips before the dispatch, so the
    // diff-actions panel reads `true` in the update cycle of the same
    // transaction. A rejected dispatch reverts the flag, for example
    // when host code already ended the streaming session. Otherwise the
    // next diff review started by hand would count as AI-owned.
    // `clearActiveSession` keeps `diffOwnedByAI` on purpose, because the
    // panel clears it on the true to false edge of the diff, and that
    // edge never fires when the dispatch never lands.
    const config = ctx.get(aiProviderConfig.key)
    if (config.diffReviewOnEnd) {
      const cur = ctx.get(aiSessionCtx.key)
      ctx.set(aiSessionCtx.key, { ...cur, diffOwnedByAI: true })
    }
    const dispatched = commands.call(endStreamingCmd.key, {
      diffReview: config.diffReviewOnEnd,
    })
    if (config.diffReviewOnEnd && !dispatched) {
      const cur = ctx.get(aiSessionCtx.key)
      ctx.set(aiSessionCtx.key, { ...cur, diffOwnedByAI: false })
    }
  } catch (error) {
    if (abortController.signal.aborted) return
    const milkdownError = aiProviderError(error)
    emitAIError(ctx, milkdownError)
    const commands = ctx.get(commandsCtx)
    commands.call(abortStreamingCmd.key, { keep: false })
  } finally {
    // Clean up only while this session stays the active one. After an
    // abort and an immediate restart, the new session owns the ctx, and
    // this one must leave it alone.
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

    // Dry run: an undefined dispatch means ProseMirror probes whether
    // the command can run. Every precondition check above is free of
    // side effects, so the probe returns true here.
    if (!dispatch) return true

    // The session label is set before the streaming plugin starts, so
    // the streaming-indicator widget reads the right label when it first
    // builds its decoration. An empty string means the caller supplied
    // no label, and the widget falls back to its configured
    // `fallbackLabel`. `lastInstruction` and `lastLabel` are stored here
    // too, so the diff-actions Retry button can re-run the same prompt.
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

    // Start streaming. A non-empty selection is replaced.
    const commands = ctx.get(commandsCtx)
    const insertAt = state.selection.empty
      ? ('cursor' as const)
      : ('selection' as const)
    if (!commands.call(startStreamingCmd.key, { insertAt })) {
      clearActiveSession(ctx)
      return false
    }

    // A try/catch guards everything after `startStreamingCmd`. A throw
    // from `buildContext` or from any other call has to abort the
    // streaming session, which would otherwise lock the editor.
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

    // Fire and forget: the provider pushes chunks asynchronously.
    // `startStreamingCmd` already dispatched its own transaction, so a
    // dispatch of `state.tr` here would overwrite the state of the
    // streaming plugin with a stale doc.
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

    // Call `abortStreamingCmd` only while the streaming plugin stays
    // active. It can finish or fail before the user clicks abort.
    if (streamingPluginKey.getState(state)?.active) {
      const commands = ctx.get(commandsCtx)
      commands.call(abortStreamingCmd.key, options)
    }
    return true
  }
})
