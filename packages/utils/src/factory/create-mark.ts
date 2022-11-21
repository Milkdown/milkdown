/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MarkSchema } from '@milkdown/core'
import type { MarkType } from '@milkdown/prose/model'
import type { MarkViewConstructor } from '@milkdown/prose/view'

import type { CommonOptions, Factory } from '../types'
import { createPluginByEnvConfig } from './common'
import {
  getCommandsPipeCtx,
  getInputRulesPipeCtx,
  getProsePluginsPipeCtx,
  getRemarkPluginsPipeCtx,
  getSchemaPipeCtx,
  getViewPipeCtx,
  idPipeCtx, injectSlicesPipeCtx,
  optionsPipeCtx,
  shortcutsPipeCtx,
} from './pieces'
import type { Pipeline } from './pipeline'

export interface MarkRest {
  id: string
  schema: (ctx: Ctx) => MarkSchema
  view?: (ctx: Ctx) => MarkViewConstructor
}

export type MarkFactory<SupportedKeys extends string, Options extends {}> = Factory<
  SupportedKeys,
  Options,
  MarkType,
  MarkRest
>

const configureMarkPipelineEnv = <SupportedKeys extends string = string, Options extends {} = {}>(
  factory: MarkFactory<SupportedKeys, Options>,
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
): Pipeline => async ({ pipelineCtx }, next) => {
    const plugin = factory(options)

    const { id, commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view, injectSlices } = plugin

    const viewOption = options?.view
    const injectOptions = injectSlices ?? []

    const pluginOptions = {
      ...(options || {}),
      view: viewOption ? (ctx: Ctx) => ({ [id]: viewOption(ctx) }) : undefined,
    }

    pipelineCtx.set(injectSlicesPipeCtx, injectOptions)
    pipelineCtx.set(idPipeCtx, id)
    pipelineCtx.set(optionsPipeCtx, pluginOptions)
    pipelineCtx.set(getRemarkPluginsPipeCtx, remarkPlugins)
    pipelineCtx.set(getSchemaPipeCtx, ctx => ({ mark: { [id]: schema(ctx) } }))
    if (commands)
      pipelineCtx.set(getCommandsPipeCtx, (type, ctx) => commands(type[id] as MarkType, ctx))

    if (inputRules)
      pipelineCtx.set(getInputRulesPipeCtx, (type, ctx) => inputRules(type[id] as MarkType, ctx))

    if (shortcuts)
      pipelineCtx.set(shortcutsPipeCtx, shortcuts)

    if (prosePlugins)
      pipelineCtx.set(getProsePluginsPipeCtx, (type, ctx) => prosePlugins(type[id] as MarkType, ctx))

    if (view)
      pipelineCtx.set(getViewPipeCtx, ctx => ({ [id]: view(ctx) }))

    await next()
  }

export const createMark = createPluginByEnvConfig(configureMarkPipelineEnv)
