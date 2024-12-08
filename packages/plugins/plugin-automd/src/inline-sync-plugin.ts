import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { $prose } from '@milkdown/utils'

import { withMeta } from './__internal__'
import { inlineSyncConfig } from './config'
import { getContextByState } from './context'
import { runReplacer } from './replacer'

/// This plugin is used to sync the inline mark.
/// It will create and remove marks automatically according to the user input.
///
/// When users type something, the plugin will transform the line (for better performance) to real markdown AST by serializer
/// and render the AST to dom by parser, thus the input texts can be displayed correctly.
export const inlineSyncPlugin = $prose((ctx: Ctx) => {
  let requestId: number | null = null
  const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC')

  return new Plugin<null>({
    key: inlineSyncPluginKey,
    state: {
      init: () => {
        return null
      },
      apply: (tr, _value, _oldState, newState) => {
        const view = ctx.get(editorViewCtx)
        if (!view.hasFocus?.() || !view.editable) return null

        if (!tr.docChanged) return null

        const meta = tr.getMeta(inlineSyncPluginKey)
        if (meta) return null

        const context = getContextByState(ctx, newState)
        if (!context) return null

        if (requestId) {
          cancelAnimationFrame(requestId)
          requestId = null
        }

        const { prevNode, nextNode, text } = context

        const { shouldSyncNode } = ctx.get(inlineSyncConfig.key)

        if (!shouldSyncNode({ prevNode, nextNode, ctx, tr, text })) return null

        requestId = requestAnimationFrame(() => {
          requestId = null

          const { dispatch, state } = ctx.get(editorViewCtx)

          runReplacer(ctx, inlineSyncPluginKey, state, dispatch, prevNode.attrs)
        })

        return null
      },
    },
  })
})

withMeta(inlineSyncPlugin, {
  displayName: 'Prose<inlineSyncPlugin>',
  group: 'Prose',
})
