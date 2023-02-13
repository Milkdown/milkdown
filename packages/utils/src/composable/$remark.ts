/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { InitReady, remarkPluginsCtx, schemaTimerCtx } from '@milkdown/core'

import type { RemarkPlugin } from '@milkdown/transformer'
import { addTimer } from './utils'

/// @internal
export type $Remark = MilkdownPlugin & {
  plugin: RemarkPlugin
}

/// Create a milkdown wrapper for [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
/// It takes a factory function which returns a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
///
/// Additional property:
/// - `plugin`: The remark plugin created.
export const $remark = (remark: (ctx: Ctx) => RemarkPlugin): $Remark => {
  const plugin: MilkdownPlugin = ctx => async () => {
    await ctx.wait(InitReady)
    const re = remark(ctx)
    ctx.update(remarkPluginsCtx, rp => [...rp, re]);
    (<$Remark>plugin).plugin = re

    return () => {
      ctx.update(remarkPluginsCtx, rp => rp.filter(x => x !== re))
    }
  }

  return <$Remark>plugin
}

/// The async version for `$remark`. You can use `await` in the factory when creating the remark plugin.
///
/// Additional property:
/// - `plugin`: The remark plugin created.
/// - `timer`: The timer which will be resolved when the remark plugin is ready.
export const $remarkAsync = (remark: (ctx: Ctx) => Promise<RemarkPlugin>, timerName?: string) =>
  addTimer<$Remark>(
    async (ctx, plugin) => {
      await ctx.wait(InitReady)
      const re = await remark(ctx)
      ctx.update(remarkPluginsCtx, rp => [...rp, re])
      plugin.plugin = re

      return () => {
        ctx.update(remarkPluginsCtx, rp => rp.filter(x => x !== re))
      }
    },
    schemaTimerCtx,
    timerName,
  )
