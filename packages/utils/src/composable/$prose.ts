/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { SchemaReady, editorStateTimerCtx, prosePluginsCtx } from '@milkdown/core'
import type { Plugin, PluginKey } from '@milkdown/prose/state'

import { addTimer } from './utils'

export type $Prose = MilkdownPlugin & {
  plugin: () => Plugin
  key: () => PluginKey | undefined
}

export const $prose = (prose: (ctx: Ctx) => Plugin): $Prose => {
  let prosePlugin: Plugin | undefined
  const plugin: MilkdownPlugin = ctx => async () => {
    await ctx.wait(SchemaReady)
    prosePlugin = prose(ctx)
    ctx.update(prosePluginsCtx, ps => [...ps, prosePlugin!])

    return () => {
      ctx.update(prosePluginsCtx, ps => ps.filter(x => x !== prosePlugin))
    }
  }
  (<$Prose>plugin).plugin = () => prosePlugin!;
  (<$Prose>plugin).key = () => prosePlugin!.spec.key

  return <$Prose>plugin
}

export const $proseAsync = (prose: (ctx: Ctx) => Promise<Plugin>, timerName?: string) => {
  let prosePlugin: Plugin | undefined
  const plugin = addTimer<$Prose>(
    async (ctx) => {
      await ctx.wait(SchemaReady)
      prosePlugin = await prose(ctx)
      ctx.update(prosePluginsCtx, ps => [...ps, prosePlugin!])

      return () => {
        ctx.update(prosePluginsCtx, ps => ps.filter(x => x !== prosePlugin))
      }
    },
    editorStateTimerCtx,
    timerName,
  )

  plugin.plugin = () => prosePlugin!
  plugin.key = () => prosePlugin!.spec.key

  return plugin
}
