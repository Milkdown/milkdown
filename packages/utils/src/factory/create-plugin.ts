/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MarkSchema, NodeSchema } from '@milkdown/core'
import type { MarkType, NodeType } from '@milkdown/prose/model'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'

import type { CommonOptions, Factory } from '../types'
import { createPluginByEnvConfig } from './common'
import {
  getCommandsPipeCtx,
  getInputRulesPipeCtx,
  getProsePluginsPipeCtx,
  getRemarkPluginsPipeCtx,
  getSchemaPipeCtx,
  getViewPipeCtx, injectSlicesPipeCtx,
  optionsPipeCtx,
  shortcutsPipeCtx,
} from './pieces'
import type { Pipeline } from './pipeline'

export type TypeMapping<NodeKeys extends string, MarkKeys extends string> =
  {
    [K in NodeKeys]: NodeType;
  } & {
    [K in MarkKeys]: MarkType;
  }

export type ViewMapping<NodeKeys extends string, MarkKeys extends string> =
  {
    [K in NodeKeys]: NodeViewConstructor;
  } & {
    [K in MarkKeys]: MarkViewConstructor;
  }

export interface PluginRest<NodeKeys extends string, MarkKeys extends string> {
  schema?: (ctx: Ctx) => {
    node?: Record<NodeKeys, NodeSchema>
    mark?: Record<MarkKeys, MarkSchema>
  }
  view?: (ctx: Ctx) => Partial<ViewMapping<NodeKeys, MarkKeys>>
}
export type PluginFactory<
  SupportedKeys extends string = string,
  Options extends {} = {},
  NodeKeys extends string = string,
  MarkKeys extends string = string,
> = Factory<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>>

export const configurePluginPipelineEnv = <SupportedKeys extends string = string, Options extends {} = {}, NodeKeys extends string = string, MarkKeys extends string = string>(
  factory: PluginFactory<SupportedKeys, Options, NodeKeys, MarkKeys>,
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
): Pipeline => async ({ pipelineCtx }, next) => {
    const plugin = factory(options)

    const { commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view, injectSlices } = plugin

    const injectOptions = injectSlices ?? []

    pipelineCtx.set(injectSlicesPipeCtx, injectOptions)
    pipelineCtx.set(optionsPipeCtx, (options || {}) as Options)
    pipelineCtx.set(getRemarkPluginsPipeCtx, remarkPlugins)
    if (schema)
      pipelineCtx.set(getSchemaPipeCtx, schema)

    if (commands)
      pipelineCtx.set(getCommandsPipeCtx, commands as never)

    if (inputRules)
      pipelineCtx.set(getInputRulesPipeCtx, inputRules as never)

    if (shortcuts)
      pipelineCtx.set(shortcutsPipeCtx, shortcuts)

    if (prosePlugins)
      pipelineCtx.set(getProsePluginsPipeCtx, prosePlugins as never)

    if (view)
      pipelineCtx.set(getViewPipeCtx, view as never)

    await next()
  }

export const createPlugin = createPluginByEnvConfig(configurePluginPipelineEnv)
