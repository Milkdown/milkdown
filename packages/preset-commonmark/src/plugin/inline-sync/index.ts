/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import { editorViewCtx } from '@milkdown/core'
import { Plugin, PluginKey } from '@milkdown/prose/state'

import { inlineSyncConfigCtx } from './config'
import { getContextByState } from './context'
import { runReplacer } from './replacer'

export * from './config'

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC')
export const getInlineSyncPlugin = (ctx: Ctx) => {
  let requestId: number | null = null
  const inlineSyncPlugin = new Plugin<null>({
    key: inlineSyncPluginKey,
    state: {
      init: () => {
        return null
      },
      apply: (tr, _value, _oldState, newState) => {
        const view = ctx.get(editorViewCtx)
        if (!view.hasFocus?.() || !view.editable)
          return null

        if (!tr.docChanged)
          return null

        const meta = tr.getMeta(inlineSyncPluginKey)
        if (meta)
          return null

        const context = getContextByState(ctx, newState)
        if (!context)
          return null

        if (requestId) {
          cancelAnimationFrame(requestId)
          requestId = null
        }

        const { prevNode, nextNode, text } = context

        const { shouldSyncNode } = ctx.get(inlineSyncConfigCtx)

        if (!shouldSyncNode({ prevNode, nextNode, ctx, tr, text }))
          return null

        requestId = requestAnimationFrame(() => {
          requestId = null

          const { dispatch, state } = ctx.get(editorViewCtx)

          runReplacer(ctx, inlineSyncPluginKey, state, dispatch, prevNode.attrs)
        })

        return null
      },
    },
  })

  return inlineSyncPlugin
}
