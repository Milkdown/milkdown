import type { MilkdownPlugin } from '@milkdown/ctx'

import {
  acceptAllDiffsCmd,
  acceptDiffChunkCmd,
  acceptDiffRangeCmd,
  clearDiffReviewCmd,
  rejectAllDiffsCmd,
  rejectDiffChunkCmd,
  rejectDiffRangeCmd,
  startDiffReviewCmd,
} from './diff-commands'
import { diffConfig } from './diff-config'
import { diffPlugin } from './diff-plugin'

export * from './types'
export { diffConfig } from './diff-config'
export { computeDocDiff } from './diff-compute'
export type { DiffIgnoreAttrs } from './diff-compute'
export {
  diffPlugin,
  diffPluginKey,
  getPendingChanges,
  isChangeRejected,
} from './diff-plugin'
export {
  acceptAllDiffsCmd,
  acceptDiffChunkCmd,
  acceptDiffRangeCmd,
  clearDiffReviewCmd,
  rejectAllDiffsCmd,
  rejectDiffChunkCmd,
  rejectDiffRangeCmd,
  startDiffReviewCmd,
} from './diff-commands'

/// The milkdown diff plugin.
export const diff: MilkdownPlugin[] = [
  diffConfig,
  diffPlugin,
  startDiffReviewCmd,
  acceptDiffChunkCmd,
  acceptDiffRangeCmd,
  rejectDiffChunkCmd,
  rejectDiffRangeCmd,
  acceptAllDiffsCmd,
  rejectAllDiffsCmd,
  clearDiffReviewCmd,
]
