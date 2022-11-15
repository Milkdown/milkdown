/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MarkSchema, MilkdownPlugin } from '@milkdown/core'
import type { MarkType } from '@milkdown/prose/model'
import type { MarkViewConstructor } from '@milkdown/prose/view'

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
  idPipeCtx,
  injectPipeEnv,
  injectSlices,
  injectSlicesPipeCtx,
  optionsPipeCtx,
  shortcutsPipeCtx,
  waitThemeReady,
} from './pieces'
import type { Pipeline } from './pipeline'
import { run } from './pipeline'

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

export type MarkCreator<SupportedKeys extends string, Options extends {}> = WithExtend<
    SupportedKeys,
    Options,
    MarkType,
    MarkRest
>

export const createMark = <SupportedKeys extends string = string, Options extends {} = {}>(
  factory: MarkFactory<SupportedKeys, Options>,
): MarkCreator<string, Options> =>
    pipe(
      addMetadata,
      withExtend(factory, createMark),
    )(
      (options?: Partial<CommonOptions<SupportedKeys, Options>>): MilkdownPlugin =>
        pre =>
          async (ctx) => {
            const setPipelineEnv: Pipeline = async ({ pipelineCtx }, next) => {
              const utils = getThemeUtils(ctx, options)
              const plugin = factory(utils, options)

              const {
                id,
                commands,
                remarkPlugins,
                schema,
                inputRules,
                shortcuts,
                prosePlugins,
                view,
                injectSlices,
              } = plugin

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
