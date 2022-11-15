/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { createSlice } from '@milkdown/core'
import type { Node, NodeType } from '@milkdown/prose/model'
import type { Transaction } from '@milkdown/prose/state'

import { swap } from './utils'

export type ShouldSyncNode = (context: {
  prevNode: Node
  nextNode: Node
  ctx: Ctx
  tr: Transaction
  text: string
}) => boolean

export interface SyncNodePlaceholder {
  hole: string
  punctuation: string
  char: string
}

export interface InlineSyncConfig {
  placeholderConfig: SyncNodePlaceholder
  shouldSyncNode: ShouldSyncNode
  globalNodes: Array<NodeType | string>
  movePlaceholder: (placeholderToMove: string, text: string) => string
}

export const defaultConfig: InlineSyncConfig = {
  placeholderConfig: {
    hole: '∅',
    punctuation: '⁂',
    char: '∴',
  },
  globalNodes: ['footnote_definition'],
  shouldSyncNode: ({ prevNode, nextNode }) =>
    prevNode.inlineContent
        && nextNode
        // if node type changes, do not sync
        && prevNode.type === nextNode.type
        // if two node fully equal, we don't modify them
        && !prevNode.eq(nextNode),
  movePlaceholder: (placeholderToMove: string, text: string) => {
    const symbolsNeedToMove = ['*', '_']

    let index = text.indexOf(placeholderToMove)
    while (symbolsNeedToMove.includes(text[index - 1] || '') && symbolsNeedToMove.includes(text[index + 1] || '')) {
      text = swap(text, index, index + 1)
      index = index + 1
    }

    return text
  },
}

export const inlineSyncConfigCtx = createSlice<InlineSyncConfig, 'inlineSyncConfig'>(defaultConfig, 'inlineSyncConfig')
