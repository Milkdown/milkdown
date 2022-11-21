/* Copyright 2021, Milkdown by Mirone. */
import type {
  CmdTuple,
  Ctx,
} from '@milkdown/core'
import {
  commandsCtx,
  createSlice,
} from '@milkdown/core'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'
import type { PluginType } from './type'
import { typePipeCtx } from './type'

export const getCommandsPipeCtx = createSlice<Maybe<(types: PluginType, ctx: Ctx) => CmdTuple[]>>(undefined, 'getCommandsPipeCtx')
export const createCommands: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env
  const commands = pipelineCtx.get(getCommandsPipeCtx)
  if (commands) {
    const type = pipelineCtx.get(typePipeCtx)
    const cs = commands(type, ctx)
    cs.forEach(([key, command]) => {
      ctx.get(commandsCtx).create(key, command)
    })
    onCleanup(() => {
      cs.forEach(([key]) => {
        ctx.get(commandsCtx).remove(key)
      })
    })
  }
  await next()
}
