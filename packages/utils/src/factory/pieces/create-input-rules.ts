/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/core'
import {
  createSlice,
  inputRulesCtx,
} from '@milkdown/core'
import type { InputRule } from '@milkdown/prose/inputrules'
import type { Maybe } from '../../types'

import type { Pipeline } from '../pipeline'
import type { PluginType } from './type'
import { typePipeCtx } from './type'
export const getInputRulesPipeCtx = createSlice<Maybe<(types: PluginType, ctx: Ctx) => InputRule[]>>(undefined, 'getInputRulesPipeCtx')
export const createInputRules: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env
  const inputRules = pipelineCtx.get(getInputRulesPipeCtx)
  if (inputRules) {
    const type = pipelineCtx.get(typePipeCtx)
    const rules = inputRules(type, ctx)
    ctx.update(inputRulesCtx, ir => [...ir, ...rules])

    onCleanup(() => {
      ctx.update(inputRulesCtx, ir => ir.filter(r => !rules.includes(r)))
    })
  }

  await next()
}
