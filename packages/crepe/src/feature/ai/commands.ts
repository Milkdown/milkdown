import type { Ctx } from '@milkdown/kit/ctx'
import type { MilkdownError } from '@milkdown/kit/exception'

import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
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
/// the AI feature's setup function from `AIFeatureConfig`.
export const aiProviderConfig = $ctx(
  {
    provider: undefined as AIProvider | undefined,
    buildContext: undefined as
      | ((ctx: Ctx, instruction: string) => AIPromptContext)
      | undefined,
    diffReviewOnEnd: true,
    onError: undefined as ((error: MilkdownError) => void) | undefined,
  },
  'aiProviderConfig'
)

/// Holds the AbortController for the current AI session (null when idle).
export const aiSessionCtx = $ctx(
  { abortController: null as AbortController | null },
  'aiSession'
)

// ---------------------------------------------------------------------------
// CSS class for visual feedback
// ---------------------------------------------------------------------------

const AI_STREAMING_CLASS = 'milkdown-ai-streaming'

function setStreamingClass(ctx: Ctx, active: boolean): void {
  try {
    const view = ctx.get(editorViewCtx)
    const root = view.dom.closest('.milkdown')
    if (root) {
      root.classList.toggle(AI_STREAMING_CLASS, active)
    }
  } catch {
    // Editor may be destroyed — ignore.
  }
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
    // Streaming complete — hand off to diff review if configured.
    const config = ctx.get(aiProviderConfig.key)
    commands.call(endStreamingCmd.key, {
      diffReview: config.diffReviewOnEnd,
    })
  } catch (error) {
    if (abortController.signal.aborted) return
    const milkdownError = aiProviderError(error)
    console.error(`[milkdown/ai] ${milkdownError.message}`)
    const config = ctx.get(aiProviderConfig.key)
    config.onError?.(milkdownError)
    const commands = ctx.get(commandsCtx)
    commands.call(abortStreamingCmd.key, { keep: false })
  } finally {
    // Only clean up if this session is still the active one. If the
    // user aborted and immediately started a new session, the new
    // session owns the ctx now and we must not clobber it.
    const current = ctx.get(aiSessionCtx.key)
    if (current.abortController === abortController) {
      setStreamingClass(ctx, false)
      ctx.set(aiSessionCtx.key, { abortController: null })
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

    // Start streaming — replaces the selection if non-empty.
    const commands = ctx.get(commandsCtx)
    const insertAt = state.selection.empty
      ? ('cursor' as const)
      : ('selection' as const)
    if (!commands.call(startStreamingCmd.key, { insertAt })) return false

    // Everything after startStreamingCmd is wrapped in try/catch: if
    // buildContext or anything else throws, we must abort the streaming
    // session to avoid leaving the editor locked with no way to recover.
    let promptContext: AIPromptContext
    try {
      const buildContext = config.buildContext ?? defaultBuildContext
      promptContext = buildContext(ctx, options.instruction)
    } catch (error) {
      const milkdownError = aiBuildContextError(error)
      console.error(`[milkdown/ai] ${milkdownError.message}`)
      config.onError?.(milkdownError)
      commands.call(abortStreamingCmd.key, { keep: false })
      return false
    }

    // Create an abort controller for this session.
    const abortController = new AbortController()
    ctx.set(aiSessionCtx.key, { abortController })

    // Visual feedback.
    setStreamingClass(ctx, true)

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
    ctx.set(aiSessionCtx.key, { abortController: null })
    setStreamingClass(ctx, false)

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
