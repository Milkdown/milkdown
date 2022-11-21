/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import {
  createSlice,
  prosePluginsCtx,
} from '@milkdown/core'
import type { Plugin } from '@milkdown/prose/state'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'
import type { PluginType } from './type'
import { typePipeCtx } from './type'

export const getProsePluginsPipeCtx = createSlice<Maybe<(types: PluginType, ctx: Ctx) => Plugin[]>>(
  undefined,
'getProsePluginsPipeCtx',
)
export const applyProsePlugins: Pipeline = async (env, next) => {
  const { pipelineCtx, ctx, onCleanup } = env

  const prosePlugins = pipelineCtx.get(getProsePluginsPipeCtx)
  if (prosePlugins) {
    const type = pipelineCtx.get(typePipeCtx)
    const plugins = prosePlugins(type, ctx)
    ctx.update(prosePluginsCtx, ps => [...ps, ...plugins])
    onCleanup(() => {
      ctx.update(prosePluginsCtx, ps => ps.filter(p => !plugins.includes(p)))
    })
  }

  await next()
}
