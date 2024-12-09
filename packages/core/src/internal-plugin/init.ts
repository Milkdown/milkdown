import type { MilkdownPlugin } from '@milkdown/ctx'
import { createTimer } from '@milkdown/ctx'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

import type { Editor } from '../editor'
import { remarkHandlers, withMeta } from '../__internal__'
import { ConfigReady } from './config'
import {
  editorCtx,
  initTimerCtx,
  inputRulesCtx,
  markViewCtx,
  nodeViewCtx,
  prosePluginsCtx,
  remarkCtx,
  remarkPluginsCtx,
  remarkStringifyOptionsCtx,
} from './atoms'

/// The timer which will be resolved when the init plugin is ready.
export const InitReady = createTimer('InitReady')

/// The init plugin.
/// This plugin prepare slices that needed by other plugins. And create a remark instance.
///
/// This plugin will wait for the config plugin.
export function init(editor: Editor): MilkdownPlugin {
  const plugin: MilkdownPlugin = (ctx) => {
    ctx
      .inject(editorCtx, editor)
      .inject(prosePluginsCtx, [])
      .inject(remarkPluginsCtx, [])
      .inject(inputRulesCtx, [])
      .inject(nodeViewCtx, [])
      .inject(markViewCtx, [])
      .inject(remarkStringifyOptionsCtx, {
        handlers: remarkHandlers,
      })
      .inject(remarkCtx, unified().use(remarkParse).use(remarkStringify))
      .inject(initTimerCtx, [ConfigReady])
      .record(InitReady)

    return async () => {
      await ctx.waitTimers(initTimerCtx)
      const options = ctx.get(remarkStringifyOptionsCtx)
      ctx.set(
        remarkCtx,
        unified().use(remarkParse).use(remarkStringify, options)
      )

      ctx.done(InitReady)

      return () => {
        ctx
          .remove(editorCtx)
          .remove(prosePluginsCtx)
          .remove(remarkPluginsCtx)
          .remove(inputRulesCtx)
          .remove(nodeViewCtx)
          .remove(markViewCtx)
          .remove(remarkStringifyOptionsCtx)
          .remove(remarkCtx)
          .remove(initTimerCtx)
          .clearTimer(InitReady)
      }
    }
  }
  withMeta(plugin, {
    displayName: 'Init',
  })

  return plugin
}
