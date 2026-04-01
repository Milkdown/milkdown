import type { Node } from '@milkdown/prose/model'

import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

import type { DiffAction, DiffState } from './types'

import { withMeta } from './__internal__/with-meta'
import { computeDocDiff } from './diff-compute'
import { diffConfig } from './diff-config'

export const diffPluginKey = new PluginKey<DiffState | null>('MILKDOWN_DIFF')

function recomputeChanges(doc: Node, state: DiffState): DiffState {
  const changes = computeDocDiff(doc, state.newDoc)
  return { ...state, changes }
}

/** Check if a change overlaps with any rejected range in newDoc */
export function isChangeRejected(
  change: { fromB: number; toB: number },
  rejectedRanges: Array<{ fromB: number; toB: number }>
): boolean {
  return rejectedRanges.some(
    (r) => change.fromB < r.toB && change.toB > r.fromB
  )
}

/** Get only the pending (non-rejected) changes */
export function getPendingChanges(state: DiffState) {
  return state.changes.filter((c) => !isChangeRejected(c, state.rejectedRanges))
}

export const diffPlugin = $prose((ctx) => {
  const config = ctx.get(diffConfig.key)

  return new Plugin<DiffState | null>({
    key: diffPluginKey,
    state: {
      init: () => null,
      apply(tr, value, _oldEditorState, newEditorState) {
        const action = tr.getMeta(diffPluginKey) as DiffAction | undefined

        if (!value) {
          if (action?.type === 'start') {
            const changes = computeDocDiff(newEditorState.doc, action.newDoc)
            return {
              newDoc: action.newDoc,
              changes,
              rejectedRanges: [],
              active: true,
            }
          }
          return null
        }

        // If document changed (from accept), recompute diff
        // The accepted change naturally disappears from the new diff
        let state = value
        if (tr.docChanged) {
          state = recomputeChanges(newEditorState.doc, state)
        }

        if (!action) return state

        let result: DiffState
        switch (action.type) {
          case 'start': {
            const changes = computeDocDiff(newEditorState.doc, action.newDoc)
            return {
              newDoc: action.newDoc,
              changes,
              rejectedRanges: [],
              active: true,
            }
          }

          case 'accept':
          case 'acceptRange':
            // The document change is handled above via tr.docChanged
            result = state
            break

          case 'reject': {
            const change = state.changes[action.changeIndex]
            if (!change) return state

            result = {
              ...state,
              rejectedRanges: [
                ...state.rejectedRanges,
                { fromB: change.fromB, toB: change.toB },
              ],
            }
            break
          }

          case 'rejectRange':
            result = {
              ...state,
              rejectedRanges: [
                ...state.rejectedRanges,
                { fromB: action.range.fromB, toB: action.range.toB },
              ],
            }
            break

          case 'acceptAll':
            return { ...state, active: false }

          case 'rejectAll':
            return { ...state, active: false }

          case 'clear':
            return null

          default:
            return state
        }

        // Auto-deactivate when all changes have been resolved
        if (result.active && getPendingChanges(result).length === 0)
          return { ...result, active: false }
        return result
      },
    },
    filterTransaction(tr, editorState) {
      if (!config.lockOnReview) return true

      const diffState = diffPluginKey.getState(editorState)
      if (!diffState?.active) return true

      if (tr.getMeta(diffPluginKey)) return true

      if (tr.docChanged) return false

      return true
    },
  })
})

withMeta(diffPlugin, {
  displayName: 'Prose<diff>',
  group: 'Diff',
})
