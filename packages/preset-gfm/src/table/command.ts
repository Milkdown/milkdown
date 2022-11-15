/* Copyright 2021, Milkdown by Mirone. */
import type { Node, NodeType } from '@milkdown/prose/model'
import type { Command } from '@milkdown/prose/state'
import { Selection } from '@milkdown/prose/state'

import { isInTable } from './plugin/util'

export const exitTable
    = (node: NodeType): Command =>
      (state, dispatch) => {
        if (!isInTable(state))
          return false

        const { $head } = state.selection
        const pos = $head.after()
        const tr = state.tr.replaceWith(pos, pos, node.createAndFill() as Node)
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1))
        dispatch?.(tr.scrollIntoView())
        return true
      }
