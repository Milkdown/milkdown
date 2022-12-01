/* Copyright 2021, Milkdown by Mirone. */

import type { MilkdownPlugin } from '@milkdown/core'
import type { Node } from '@milkdown/prose/model'
import type { EditorState } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $ctx, $prose } from '@milkdown/utils'

export interface Options {
  shouldAppend: (lastNode: Node | null, state: EditorState) => boolean
  getNode: (state: EditorState) => Node
}

const trailingConfig = $ctx<Options, 'trailingConfig'>({
  shouldAppend: (lastNode) => {
    if (!lastNode)
      return false

    if (['heading', 'paragraph'].includes(lastNode.type.name))
      return false

    return true
  },
  getNode: state => state.schema.nodes.paragraph!.create(),
}, 'trailingConfig')

export const trailingPlugin = $prose((ctx) => {
  const trailingPluginKey = new PluginKey('MILKDOWN_TRAILING')
  const { shouldAppend, getNode } = ctx.get(trailingConfig.key)
  const plugin = new Plugin({
    key: trailingPluginKey,
    state: {
      init: (_, state) => {
        const lastNode = state.tr.doc.lastChild

        return shouldAppend(lastNode, state)
      },
      apply: (tr, value, _, state) => {
        if (!tr.docChanged)
          return value

        const lastNode = tr.doc.lastChild

        return shouldAppend(lastNode, state)
      },
    },
    appendTransaction: (_, __, state) => {
      const { doc, tr } = state
      const nodeType = getNode?.(state)
      const shouldInsertNodeAtEnd = plugin.getState(state)
      const endPosition = doc.content.size

      if (!shouldInsertNodeAtEnd || !nodeType)
        return

      return tr.insert(endPosition, nodeType)
    },
  })

  return plugin
})

export const trailing: MilkdownPlugin[] = [trailingConfig, trailingPlugin]
