/* Copyright 2021, Milkdown by Mirone. */
import {
  createSlice,
} from '@milkdown/core'

import type { Pipeline } from '../pipeline'
import { getProsePluginsPipeCtx } from './apply-prose-plugins'
import { getRemarkPluginsPipeCtx } from './apply-remark-plugins'
import { getSchemaPipeCtx } from './apply-schema'
import { getViewPipeCtx } from './apply-view'
import { getCommandsPipeCtx } from './create-commands'
import { getInputRulesPipeCtx } from './create-input-rules'
import { shortcutsPipeCtx } from './create-shortcuts'
import { injectSlicesPipeCtx } from './inject-slices'
import { optionsPipeCtx } from './options'
import { typePipeCtx } from './type'

export const idPipeCtx = createSlice('', 'idPipeCtx')

export const injectPipeEnv: Pipeline = async (env, next) => {
  const { pipelineCtx } = env
  pipelineCtx
    .inject(idPipeCtx)
    .inject(optionsPipeCtx)
    .inject(injectSlicesPipeCtx)
    .inject(getRemarkPluginsPipeCtx)
    .inject(getSchemaPipeCtx)
    .inject(typePipeCtx)
    .inject(getCommandsPipeCtx)
    .inject(getInputRulesPipeCtx)
    .inject(shortcutsPipeCtx)
    .inject(getProsePluginsPipeCtx)
    .inject(getViewPipeCtx)

  await next()
}
