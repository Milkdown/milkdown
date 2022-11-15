/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MarkSchema, MilkdownPlugin, NodeSchema } from '@milkdown/core'
import type { MarkType, NodeType } from '@milkdown/prose/model'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'

import { pipe } from '../pipe'
import type { CommonOptions, Factory, WithExtend } from '../types'
import { addMetadata, getThemeUtils, withExtend } from './common'
import {
  applyProsePlugins,
  applyRemarkPlugins,
  applySchema,
  applyView,
  createCommands,
  createInputRules,
  createShortcuts,
  getCommandsPipeCtx,
  getInputRulesPipeCtx,
  getProsePluginsPipeCtx,
  getRemarkPluginsPipeCtx,
  getSchemaPipeCtx,
  getViewPipeCtx,
  injectPipeEnv,
  injectSlices,
  injectSlicesPipeCtx,
  optionsPipeCtx,
  shortcutsPipeCtx,
  waitThemeReady,
} from './pieces'
import type { Pipeline } from './pipeline'
import { run } from './pipeline'

export type TypeMapping<NodeKeys extends string, MarkKeys extends string> = {
  [K in NodeKeys]: NodeType;
} & {
  [K in MarkKeys]: MarkType;
}

export type ViewMapping<NodeKeys extends string, MarkKeys extends string> = {
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

export const createPlugin = <
    SupportedKeys extends string = string,
    Options extends {} = {},
    NodeKeys extends string = string,
    MarkKeys extends string = string,
>(
    factory: PluginFactory<SupportedKeys, Options, NodeKeys, MarkKeys>,
  ): WithExtend<SupportedKeys, Options, TypeMapping<NodeKeys, MarkKeys>, PluginRest<NodeKeys, MarkKeys>> =>
    pipe(
      addMetadata,
      withExtend(factory, createPlugin),
    )(
      (options?: Partial<CommonOptions<SupportedKeys, Options>>): MilkdownPlugin =>
        pre =>
          async (ctx) => {
            const setPipelineEnv: Pipeline = async ({ pipelineCtx }, next) => {
              const utils = getThemeUtils(ctx, options)
              const plugin = factory(utils, options)

              const { commands, remarkPlugins, schema, inputRules, shortcuts, prosePlugins, view, injectSlices }
                        = plugin

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

            const runner = run([
              injectPipeEnv,
              waitThemeReady,
              setPipelineEnv,
              injectSlices,
              applyRemarkPlugins,
              applySchema,
              createCommands,
              createInputRules,
              createShortcuts,
              applyProsePlugins,
              applyView,
            ])

            await runner(pre, ctx)

            return runner.runCleanup
          },
    )
