import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import {
  SchemaReady,
  editorStateTimerCtx,
  prosePluginsCtx,
} from '@milkdown/core'
import type { Plugin, PluginKey } from '@milkdown/prose/state'

import { addTimer } from './utils'

/// @internal
export type $Prose = MilkdownPlugin & {
  plugin: () => Plugin
  key: () => PluginKey | undefined
}

/// Create a milkdown wrapper for [prosemirror plugin](https://prosemirror.net/docs/ref/#state.Plugin).
/// It takes a factory function which returns a [prosemirror plugin](https://prosemirror.net/docs/ref/#state.Plugin).
///
/// Additional property:
/// - `plugin`: The prosemirror plugin created.
/// - `key`: The [prosemirror plugin key](https://prosemirror.net/docs/ref/#state.PluginKey) of the plugin.
export function $prose(prose: (ctx: Ctx) => Plugin): $Prose {
  let prosePlugin: Plugin | undefined
  const plugin: MilkdownPlugin = (ctx) => async () => {
    await ctx.wait(SchemaReady)
    prosePlugin = prose(ctx)
    ctx.update(prosePluginsCtx, (ps) => [...ps, prosePlugin!])

    return () => {
      ctx.update(prosePluginsCtx, (ps) => ps.filter((x) => x !== prosePlugin))
    }
  }
  ;(<$Prose>plugin).plugin = () => prosePlugin!
  ;(<$Prose>plugin).key = () => prosePlugin!.spec.key

  return <$Prose>plugin
}

/// The async version for `$prose`. You can use `await` in the factory when creating the plugin.
///
/// Additional property:
/// - `plugin`: The prosemirror plugin created.
/// - `key`: The [prosemirror plugin key](https://prosemirror.net/docs/ref/#state.PluginKey) of the plugin.
/// - `timer`: The timer which will be resolved when the plugin is ready.
export function $proseAsync(
  prose: (ctx: Ctx) => Promise<Plugin>,
  timerName?: string
) {
  let prosePlugin: Plugin | undefined
  const plugin = addTimer<$Prose>(
    async (ctx) => {
      await ctx.wait(SchemaReady)
      prosePlugin = await prose(ctx)
      ctx.update(prosePluginsCtx, (ps) => [...ps, prosePlugin!])

      return () => {
        ctx.update(prosePluginsCtx, (ps) => ps.filter((x) => x !== prosePlugin))
      }
    },
    editorStateTimerCtx,
    timerName
  )

  plugin.plugin = () => prosePlugin!
  plugin.key = () => prosePlugin!.spec.key

  return plugin
}
