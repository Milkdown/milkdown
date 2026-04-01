import type { Transaction } from '@milkdown/prose/state'

import { parserCtx } from '@milkdown/core'
import { $command } from '@milkdown/utils'

import type { DiffAction, DiffRange, DiffState } from './types'

import { withMeta } from './__internal__/with-meta'
import { diffPluginKey, getPendingChanges } from './diff-plugin'

/**
 * Apply pending (non-rejected) changes from last to first.
 * Reverse iteration is safe because changeset guarantees
 * changes are ordered and non-overlapping.
 */
function applyPendingChanges(
  tr: Transaction,
  diffState: DiffState
): Transaction {
  const pending = getPendingChanges(diffState)
  for (let i = pending.length - 1; i >= 0; i--) {
    const change = pending[i]!
    const newContent = diffState.newDoc.slice(change.fromB, change.toB)
    tr = tr.replace(change.fromA, change.toA, newContent)
  }
  return tr
}

export const startDiffReviewCmd = $command('StartDiffReview', (ctx) => {
  return (modifiedMarkdown?: string) => (state, dispatch) => {
    if (!modifiedMarkdown) return false

    const parser = ctx.get(parserCtx)
    const newDoc = parser(modifiedMarkdown)

    if (dispatch) {
      const tr = state.tr.setMeta(diffPluginKey, {
        type: 'start',
        newDoc,
      } satisfies DiffAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(startDiffReviewCmd, {
  displayName: 'Command<startDiffReview>',
  group: 'Diff',
})

export const acceptDiffChunkCmd = $command('AcceptDiffChunk', () => {
  return (changeIndex?: number) => (state, dispatch) => {
    if (changeIndex == null) return false

    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    const pending = getPendingChanges(diffState)
    const change = pending[changeIndex]
    if (!change) return false

    if (dispatch) {
      // Two-phase: the replace changes the doc, which triggers recompute
      // in the plugin's apply(). The 'accept' meta is then a no-op —
      // the accepted change naturally disappears from the recomputed diff.
      const newContent = diffState.newDoc.slice(change.fromB, change.toB)
      let tr = state.tr.replace(change.fromA, change.toA, newContent)

      tr = tr.setMeta(diffPluginKey, {
        type: 'accept',
        changeIndex,
      } satisfies DiffAction)

      dispatch(tr)
    }
    return true
  }
})

withMeta(acceptDiffChunkCmd, {
  displayName: 'Command<acceptDiffChunk>',
  group: 'Diff',
})

export const rejectDiffChunkCmd = $command('RejectDiffChunk', () => {
  return (changeIndex?: number) => (state, dispatch) => {
    if (changeIndex == null) return false

    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    const pending = getPendingChanges(diffState)
    const change = pending[changeIndex]
    if (!change) return false

    if (dispatch) {
      // Send fromB/toB directly instead of index, because pending
      // indices shift as changes are rejected.
      const tr = state.tr.setMeta(diffPluginKey, {
        type: 'reject',
        fromB: change.fromB,
        toB: change.toB,
      } satisfies DiffAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(rejectDiffChunkCmd, {
  displayName: 'Command<rejectDiffChunk>',
  group: 'Diff',
})

/// Accept a diff by explicit range. Used for merged custom block changes
/// (tables, image-blocks, code blocks) where multiple sub-changes are
/// grouped into a single visual change.
export const acceptDiffRangeCmd = $command('AcceptDiffRange', () => {
  return (range?: DiffRange) => (state, dispatch) => {
    if (!range) return false

    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    if (dispatch) {
      const newContent = diffState.newDoc.slice(range.fromB, range.toB)
      let tr = state.tr.replace(range.fromA, range.toA, newContent)

      tr = tr.setMeta(diffPluginKey, {
        type: 'acceptRange',
        range,
      } satisfies DiffAction)

      dispatch(tr)
    }
    return true
  }
})

withMeta(acceptDiffRangeCmd, {
  displayName: 'Command<acceptDiffRange>',
  group: 'Diff',
})

/// Reject a diff by explicit range.
export const rejectDiffRangeCmd = $command('RejectDiffRange', () => {
  return (range?: DiffRange) => (state, dispatch) => {
    if (!range) return false

    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    if (dispatch) {
      const tr = state.tr.setMeta(diffPluginKey, {
        type: 'rejectRange',
        range,
      } satisfies DiffAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(rejectDiffRangeCmd, {
  displayName: 'Command<rejectDiffRange>',
  group: 'Diff',
})

export const acceptAllDiffsCmd = $command('AcceptAllDiffs', () => {
  return () => (state, dispatch) => {
    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    if (dispatch) {
      const tr =
        diffState.rejectedRanges.length === 0
          ? state.tr.replaceWith(
              // Fast path: no rejections, replace entire document at once.
              // This avoids position drift issues from multiple sequential replaces.
              0,
              state.doc.content.size,
              diffState.newDoc.content
            )
          : applyPendingChanges(state.tr, diffState)

      dispatch(
        tr.setMeta(diffPluginKey, {
          type: 'acceptAll',
        } satisfies DiffAction)
      )
    }
    return true
  }
})

withMeta(acceptAllDiffsCmd, {
  displayName: 'Command<acceptAllDiffs>',
  group: 'Diff',
})

export const rejectAllDiffsCmd = $command('RejectAllDiffs', () => {
  return () => (state, dispatch) => {
    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    if (dispatch) {
      const tr = state.tr.setMeta(diffPluginKey, {
        type: 'rejectAll',
      } satisfies DiffAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(rejectAllDiffsCmd, {
  displayName: 'Command<rejectAllDiffs>',
  group: 'Diff',
})

export const clearDiffReviewCmd = $command('ClearDiffReview', () => {
  return () => (state, dispatch) => {
    const diffState = diffPluginKey.getState(state)
    if (!diffState) return false

    if (dispatch) {
      const tr = state.tr.setMeta(diffPluginKey, {
        type: 'clear',
      } satisfies DiffAction)
      dispatch(tr)
    }
    return true
  }
})

withMeta(clearDiffReviewCmd, {
  displayName: 'Command<clearDiffReview>',
  group: 'Diff',
})
