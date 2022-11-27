/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/core'
import type { Transaction } from '@milkdown/prose/state'
import { AllSelection, TextSelection } from '@milkdown/prose/state'
import { $ctx, $shortcut } from '@milkdown/utils'

export interface Options {
  type: 'space' | 'tab'
  size: number
}

const updateIndent = (tr: Transaction, options: Options): Transaction => {
  const { doc, selection } = tr

  if (!doc || !selection)
    return tr

  if (!(selection instanceof TextSelection || selection instanceof AllSelection))
    return tr

  const { to } = selection

  const text = options.type === 'space' ? Array(options.size).fill(' ').join('') : '\t'

  return tr.insertText(text, to)
}

export const indentConfig = $ctx<Options, 'indentConfig'>({ type: 'space', size: 2 }, 'indentConfig')

export const indentPlugin = $shortcut(ctx => ({
  Tab: (state, dispatch) => {
    const config = ctx.get(indentConfig.key)
    const { tr } = state
    const _tr = updateIndent(tr, config)

    if (_tr.docChanged) {
      dispatch?.(_tr)
      return true
    }

    return false
  },
}))

export const indent: MilkdownPlugin[] = [indentConfig, indentPlugin]
