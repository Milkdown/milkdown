/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { InitReady, remarkPluginsCtx, schemaTimerCtx } from '@milkdown/core'

import type { RemarkPlugin } from '@milkdown/transformer'
import { addTimer } from './utils'

export type $Remark = MilkdownPlugin & {
  plugin: RemarkPlugin
}

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
