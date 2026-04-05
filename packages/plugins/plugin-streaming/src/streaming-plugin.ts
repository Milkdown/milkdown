import type { Ctx } from '@milkdown/ctx'
import type { EditorView } from '@milkdown/prose/view'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

import type { StreamingAction, StreamingConfig, StreamingState } from './types'

import { withMeta } from './__internal__/with-meta'
import { performFlush } from './flush'
import { streamingConfig } from './streaming-config'

/// The plugin key for accessing streaming state.
export const streamingPluginKey = new PluginKey<StreamingState | null>(
  'MILKDOWN_STREAMING'
)

/// Pure state reducer for the streaming plugin. Exported for testing.
export function applyStreamingAction(
  state: StreamingState | null,
  action: StreamingAction | undefined
): StreamingState | null {
  if (!state && action?.type !== 'start') return null
  if (!action) return state

  switch (action.type) {
    case 'start':
      return {
        buffer: '',
        originalDoc: action.originalDoc,
        active: true,
        lastApplyTime: action.lastApplyTime,
        insertPos: action.insertPos ?? null,
        insertEndPos: action.insertEndPos ?? action.insertPos ?? null,
      }

    case 'push': {
      if (!state) return null
      return { ...state, buffer: state.buffer + action.token }
    }

    case 'apply': {
      if (!state) return null
      return {
        ...state,
        lastApplyTime: action.lastApplyTime,
        insertEndPos: action.insertEndPos ?? state.insertEndPos,
      }
    }

    case 'end':
    case 'abort':
      return null

    default:
      return state
  }
}

/// The ProseMirror plugin that manages streaming state and the flush loop.
export const streamingPlugin = $prose((ctx) => {
  const config = ctx.get(streamingConfig.key)

  return new Plugin<StreamingState | null>({
    key: streamingPluginKey,
    state: {
      init: () => null,
      apply(tr, value) {
        const action = tr.getMeta(streamingPluginKey) as
          | StreamingAction
          | undefined
        let state = applyStreamingAction(value, action)

        // Map insert positions through transaction mapping when the doc
        // changes from a non-streaming transaction (e.g. collaborative edits
        // when lockDuringStreaming is disabled).
        if (
          state?.active &&
          state.insertPos != null &&
          tr.docChanged &&
          !action
        ) {
          state = {
            ...state,
            insertPos: tr.mapping.map(state.insertPos),
            insertEndPos:
              state.insertEndPos != null
                ? tr.mapping.map(state.insertEndPos)
                : null,
          }
        }

        return state
      },
    },
    filterTransaction(tr, editorState) {
      if (!config.lockDuringStreaming) return true

      const state = streamingPluginKey.getState(editorState)
      if (!state?.active) return true

      // Allow streaming plugin's own transactions
      if (tr.getMeta(streamingPluginKey)) return true

      // Block user edits during streaming
      if (tr.docChanged) return false

      return true
    },
    view() {
      return createFlushController(ctx, config)
    },
  })
})

withMeta(streamingPlugin, {
  displayName: 'Prose<streaming>',
  group: 'Streaming',
})

/**
 * Creates the view controller that manages the throttled flush loop.
 * It watches for buffer growth and periodically parses + diffs + applies.
 */
function createFlushController(ctx: Ctx, config: StreamingConfig) {
  let trailingTimer: ReturnType<typeof setTimeout> | null = null
  let lastKnownBufferLen = -1
  let view: EditorView | null = null

  function flush() {
    if (!view) return

    const state = streamingPluginKey.getState(view.state)
    if (!state?.active || state.buffer.length === lastKnownBufferLen) return

    lastKnownBufferLen = state.buffer.length

    const result = performFlush(ctx, view.state.tr, state)
    if (!result.newDoc) return
    let tr = result.tr

    // Skip dispatch when flush produced no document changes
    if (!tr.docChanged && result.insertEndPos == null) return

    tr = tr.setMeta(streamingPluginKey, {
      type: 'apply',
      lastApplyTime: Date.now(),
      insertEndPos: result.insertEndPos,
    } satisfies StreamingAction)

    if (config.scrollFollow) tr = tr.scrollIntoView()

    view.dispatch(tr)
  }

  function scheduleTrailingFlush() {
    if (trailingTimer != null) clearTimeout(trailingTimer)
    trailingTimer = setTimeout(flush, config.throttleMs)
  }

  return {
    update(updatedView: EditorView) {
      view = updatedView

      const state = streamingPluginKey.getState(updatedView.state)
      if (!state?.active) {
        // Streaming ended or aborted — clean up trailing timer
        if (trailingTimer != null) {
          clearTimeout(trailingTimer)
          trailingTimer = null
        }
        lastKnownBufferLen = -1
        return
      }

      // Check if buffer has grown since last flush
      if (state.buffer !== lastKnownBuffer) {
        const elapsed = Date.now() - state.lastApplyTime
        if (elapsed >= config.throttleMs) {
          flush()
        } else {
          scheduleTrailingFlush()
        }
      }
    },
    destroy() {
      if (trailingTimer != null) {
        clearTimeout(trailingTimer)
        trailingTimer = null
      }
      view = null
    },
  }
}
