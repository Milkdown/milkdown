import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { createTimer } from '@milkdown/ctx'
import { withMeta } from '../__internal__'

/// @internal
export type Config = (ctx: Ctx) => void | Promise<void>

/// The timer which will be resolved when the config plugin is ready.
export const ConfigReady = createTimer('ConfigReady')

/// The config plugin.
/// This plugin will load all user configs.
export function config(configure: Config): MilkdownPlugin {
  const plugin: MilkdownPlugin = (ctx) => {
    ctx.record(ConfigReady)

    return async () => {
      await configure(ctx)
      ctx.done(ConfigReady)

      return () => {
        ctx.clearTimer(ConfigReady)
      }
    }
  }

  withMeta(plugin, {
    displayName: 'Config',
  })

  return plugin
}
