/* Copyright 2021, Milkdown by Mirone. */
import type { Refractor } from 'refractor/lib/core'

import { findChildren } from '@milkdown/prose'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { refractor } from 'refractor'

import { $ctx, $prose } from '@milkdown/utils'
import type { MilkdownPlugin } from '@milkdown/ctx'
import { getDecorations } from './get-decorations'

export interface Options {
  configureRefractor: (refractor: Refractor) => void | Refractor
}

export const prismConfig = $ctx<Options, 'prismConfig'>({
  configureRefractor: () => {},
}, 'prismConfig')

export const prismPlugin = $prose((ctx) => {
  const { configureRefractor } = ctx.get(prismConfig.key)
  const name = 'code_block'
  return new Plugin({
    key: new PluginKey('MILKDOWN_PRISM'),
    state: {
      init: (_, { doc }) => {
        const result = configureRefractor(refractor)
        return getDecorations(doc, name, result ?? refractor)
      },
      apply: (transaction, decorationSet, oldState, state) => {
        const isNodeName = state.selection.$head.parent.type.name === name
        const isPreviousNodeName = oldState.selection.$head.parent.type.name === name
        const oldNode = findChildren(node => node.type.name === name)(oldState.doc)
        const newNode = findChildren(node => node.type.name === name)(state.doc)
        const codeBlockChanged
                    = transaction.docChanged
                    && (isNodeName
                        || isPreviousNodeName
                        || oldNode.length !== newNode.length
                        || oldNode[0]?.node.attrs.language !== newNode[0]?.node.attrs.language
                        || transaction.steps.some((step) => {
                          const s = step as unknown as { from: number; to: number }
                          return (
                            s.from !== undefined
                                && s.to !== undefined
                                && oldNode.some((node) => {
                                  return node.pos >= s.from && node.pos + node.node.nodeSize <= s.to
                                })
                          )
                        }))

        if (codeBlockChanged)
          return getDecorations(transaction.doc, name, refractor)

        return decorationSet.map(transaction.mapping, transaction.doc)
      },
    },
    props: {
      decorations(this: Plugin, state) {
        return this.getState(state)
      },
    },
  })
})

export const prism: MilkdownPlugin[] = [prismPlugin, prismConfig]
