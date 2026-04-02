import { commandsCtx } from '@milkdown/core'
import { startDiffReviewCmd } from '@milkdown/plugin-diff'
import { Slice } from '@milkdown/prose/model'
import { $command } from '@milkdown/utils'

import type {
  AbortStreamingOptions,
  EndStreamingOptions,
  StreamingAction,
} from './types'

import { withMeta } from './__internal__/with-meta'
import { flushBuffer } from './flush'
import { streamingConfig } from './streaming-config'
import { streamingPluginKey } from './streaming-plugin'

/// Start a streaming session. Captures the current doc and locks editing.
export const startStreamingCmd = $command('StartStreaming', () => {
  return () => (state, dispatch) => {
    // Don't start if already streaming
    const existing = streamingPluginKey.getState(state)
    if (existing?.active) return false

    if (dispatch) {
      const tr = state.tr.setMeta(streamingPluginKey, {
        type: 'start',
        originalDoc: state.doc,
      } satisfies StreamingAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(startStreamingCmd, {
  displayName: 'Command<startStreaming>',
  group: 'Streaming',
})

/// Push a token chunk to the streaming buffer.
export const pushChunkCmd = $command('PushChunk', () => {
  return (token?: string) => (state, dispatch) => {
    if (token == null) return false

    const streamingState = streamingPluginKey.getState(state)
    if (!streamingState?.active) return false

    if (dispatch) {
      const tr = state.tr.setMeta(streamingPluginKey, {
        type: 'push',
        token,
      } satisfies StreamingAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(pushChunkCmd, {
  displayName: 'Command<pushChunk>',
  group: 'Streaming',
})

/// End the streaming session. Performs a final flush and optionally
/// hands off to diff review mode.
export const endStreamingCmd = $command('EndStreaming', (ctx) => {
  return (options?: EndStreamingOptions) => (state, dispatch) => {
    const streamingState = streamingPluginKey.getState(state)
    if (!streamingState?.active) return false

    if (dispatch) {
      const config = ctx.get(streamingConfig.key)
      const diffReview = options?.diffReview ?? config.diffReviewOnEnd

      // Final flush
      const result = flushBuffer(ctx, state.tr, streamingState.buffer)
      let tr = result.tr
      const newDoc = result.newDoc

      // End streaming
      tr = tr.setMeta(streamingPluginKey, {
        type: 'end',
      } satisfies StreamingAction)

      // Diff review handoff: restore original doc, then start diff review
      if (diffReview && newDoc) {
        // Replace content with original doc
        tr = tr.replace(
          0,
          tr.doc.content.size,
          new Slice(streamingState.originalDoc.content, 0, 0)
        )
        dispatch(tr)

        // Start diff review via public command (separate transaction).
        // This is not atomic with the above dispatch, but streaming state
        // is already null at this point so filterTransaction won't block it.
        try {
          const commands = ctx.get(commandsCtx)
          commands.call(startDiffReviewCmd.key, streamingState.buffer)
        } catch (e) {
          console.warn('[milkdown/streaming] diff review handoff skipped:', e)
        }
        return
      }

      dispatch(tr)
    }
    return true
  }
})

withMeta(endStreamingCmd, {
  displayName: 'Command<endStreaming>',
  group: 'Streaming',
})

/// Abort the streaming session. Optionally keep partial content or
/// restore the original document.
export const abortStreamingCmd = $command('AbortStreaming', () => {
  return (options?: AbortStreamingOptions) => (state, dispatch) => {
    const streamingState = streamingPluginKey.getState(state)
    if (!streamingState?.active) return false

    if (dispatch) {
      const keep = options?.keep ?? false
      let tr = state.tr

      if (!keep) {
        // Restore original document
        tr = tr.replace(
          0,
          state.doc.content.size,
          new Slice(streamingState.originalDoc.content, 0, 0)
        )
      }

      tr = tr.setMeta(streamingPluginKey, {
        type: 'abort',
      } satisfies StreamingAction)

      dispatch(tr)
    }
    return true
  }
})

withMeta(abortStreamingCmd, {
  displayName: 'Command<abortStreaming>',
  group: 'Streaming',
})
