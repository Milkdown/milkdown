/* Copyright 2021, Milkdown by Mirone. */
import type {
  Ctx, RemarkPlugin,
} from '@milkdown/core'
import {
  InitReady, createSlice, remarkPluginsCtx,
} from '@milkdown/core'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'

export const getRemarkPluginsPipeCtx = createSlice<Maybe<(ctx: Ctx) => RemarkPlugin[]>>(undefined, 'getRemarkPluginsPipeCtx')
export const applyRemarkPlugins: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env

  await ctx.wait(InitReady)

  const remarkPlugins = pipelineCtx.get(getRemarkPluginsPipeCtx)

  if (remarkPlugins) {
    const plugins = remarkPlugins(ctx)

    ctx.update(remarkPluginsCtx, ps => ps.concat(plugins))

    onCleanup(() => {
      ctx.update(remarkPluginsCtx, ps => ps.filter(p => !plugins.includes(p)))
    })
  }

  await next()
}
