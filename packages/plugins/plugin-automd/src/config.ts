import type { Ctx } from '@milkdown/ctx'
import type { Node, NodeType } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'
import { $ctx } from '@milkdown/utils'

import { withMeta } from './__internal__'
import { swap } from './utils'

/// @internal
export type ShouldSyncNode = (context: {
  prevNode: Node
  nextNode: Node
  ctx: Ctx
  tr: Transaction
  text: string
}) => boolean

/// @internal
export interface SyncNodePlaceholder {
  hole: string
  punctuation: string
  char: string
}

/// @internal
export interface InlineSyncConfig {
  placeholderConfig: SyncNodePlaceholder
  shouldSyncNode: ShouldSyncNode
  globalNodes: Array<NodeType | string>
  movePlaceholder: (placeholderToMove: string, text: string) => string
}

/// @internal
export const defaultConfig: InlineSyncConfig = {
  placeholderConfig: {
    hole: '∅',
    punctuation: '⁂',
    char: '∴',
  },
  globalNodes: ['footnote_definition'],
  shouldSyncNode: ({ prevNode, nextNode }) =>
    prevNode.inlineContent &&
    nextNode &&
    // if node type changes, do not sync
    prevNode.type === nextNode.type &&
    // if two node fully equal, we don't modify them
    !prevNode.eq(nextNode),
  movePlaceholder: (placeholderToMove: string, text: string) => {
    const symbolsNeedToMove = ['*', '_']

    let index = text.indexOf(placeholderToMove)
    while (
      symbolsNeedToMove.includes(text[index - 1] || '') &&
      symbolsNeedToMove.includes(text[index + 1] || '')
    ) {
      text = swap(text, index, index + 1)
      index = index + 1
    }

    return text
  },
}

/// A slice that contains the inline sync config.
/// You can set value to this slice to change the config.
///
/// ```typescript
/// ctx.update(inlineSyncConfigCtx, (prevCfg) => ({
///   ...prevCfg,
///   // your config
/// }));
/// ```
///
/// You can find the default config [here](https://github.com/Milkdown/milkdown/blob/main/packages/plugin-automd/src/config.ts).
export const inlineSyncConfig = $ctx<InlineSyncConfig, 'inlineSyncConfig'>(
  defaultConfig,
  'inlineSyncConfig'
)

withMeta(inlineSyncConfig, {
  displayName: 'Ctx<inlineSyncConfig>',
  group: 'Prose',
})
