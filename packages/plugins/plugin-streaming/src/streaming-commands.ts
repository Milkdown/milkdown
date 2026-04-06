import { commandsCtx } from '@milkdown/core'
import { startDiffReviewFromDocCmd } from '@milkdown/plugin-diff'
import { Slice } from '@milkdown/prose/model'
import { $command } from '@milkdown/utils'

import type {
  AbortStreamingOptions,
  EndStreamingOptions,
  StartStreamingOptions,
  StreamingAction,
} from './types'

import { withMeta } from './__internal__/with-meta'
import { performFlush } from './flush'
import { streamingConfig } from './streaming-config'
import { streamingPluginKey } from './streaming-plugin'

/// Start a streaming session. Captures the current doc and locks editing.
/// Pass `{ insertAt: 'cursor' }` or `{ insertAt: <pos> }` for insert-at-cursor mode.
export const startStreamingCmd = $command('StartStreaming', () => {
  return (options?: StartStreamingOptions) => (state, dispatch) => {
    // Don't start if already streaming
    const existing = streamingPluginKey.getState(state)
    if (existing?.active) return false

    if (dispatch) {
      let insertPos: number | undefined
      let insertEndPos: number | undefined
      if (options?.insertAt != null) {
        const rawPos =
          options.insertAt === 'cursor'
            ? state.selection.head
            : options.insertAt
        if (!Number.isFinite(rawPos)) return false
        insertPos = Math.max(
          0,
          Math.min(Math.round(rawPos), state.doc.content.size)
        )

        // If cursor is inside a top-level empty textblock (e.g. the default
        // empty paragraph in a new editor), snap the range to cover the whole
        // block so that block-level content replaces it cleanly.
        // Only depth === 1 — nested empty textblocks (inside list items,
        // blockquotes, etc.) should not be snapped; the normal strategy
        // handles them correctly at their original position.
        const resolved = state.doc.resolve(insertPos)
        if (
          resolved.parent.isTextblock &&
          !resolved.parent.type.spec.code &&
          resolved.parent.content.size === 0 &&
          resolved.depth === 1
        ) {
          insertPos = resolved.before(resolved.depth)
          insertEndPos = resolved.after(resolved.depth)
        }
      }

      const tr = state.tr.setMeta(streamingPluginKey, {
        type: 'start',
        originalDoc: state.doc,
        insertPos,
        insertEndPos,
        lastApplyTime: Date.now(),
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

      const result = performFlush(ctx, state.tr, streamingState)
      let tr = result.tr

      // End streaming
      tr = tr.setMeta(streamingPluginKey, {
        type: 'end',
      } satisfies StreamingAction)

      // Diff review handoff: restore original doc, then start diff review.
      // Note: when lockDuringStreaming is disabled, restoring originalDoc
      // discards any concurrent edits made during the streaming session.
      if (diffReview && result.newDoc) {
        const finalDoc = tr.doc

        tr = tr.replace(
          0,
          tr.doc.content.size,
          new Slice(streamingState.originalDoc.content, 0, 0)
        )
        dispatch(tr)

        // Start diff review via public command (separate transaction).
        // Always use startDiffReviewFromDocCmd to avoid the serialize→parse
        // round-trip which can produce heading ID mismatches and other
        // attribute differences.
        try {
          const commands = ctx.get(commandsCtx)
          commands.call(startDiffReviewFromDocCmd.key, finalDoc)
        } catch (e) {
          console.warn('[milkdown/streaming] diff review handoff skipped:', e)
        }
        return true
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
        // Restore original document (both insert and replace modes).
        // Note: when lockDuringStreaming is disabled, this discards any
        // concurrent edits made during the streaming session.
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
