/* Copyright 2021, Milkdown by Mirone. */

import type { Ctx, MilkdownPlugin, NodeSchema } from '@milkdown/core'
import type { NodeType } from '@milkdown/prose/model'
import type { NodeViewConstructor } from '@milkdown/prose/view'

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

export interface NodeRest {
  id: string
  schema: (ctx: Ctx) => NodeSchema
  view?: (ctx: Ctx) => NodeViewConstructor
}

export type NodeFactory<SupportedKeys extends string, Options extends {}> = Factory<
    SupportedKeys,
    Options,
    NodeType,
    NodeRest
>

export type NodeCreator<
    SupportedKeys extends string = string,
    Options extends {} = {},
> = WithExtend<SupportedKeys, Options, NodeType, NodeRest>

export const createNode = <SupportedKeys extends string = string, Options extends {} = {}>(
  factory: NodeFactory<SupportedKeys, Options>,
): NodeCreator<SupportedKeys, Options> =>
    pipe(
      addMetadata,
      withExtend(factory, createNode),
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
              pipelineCtx.set(getSchemaPipeCtx, ctx => ({ node: { [id]: schema(ctx) } }))
              if (commands)
                pipelineCtx.set(getCommandsPipeCtx, (type, ctx) => commands(type[id] as NodeType, ctx))

              if (inputRules)
                pipelineCtx.set(getInputRulesPipeCtx, (type, ctx) => inputRules(type[id] as NodeType, ctx))

              if (shortcuts)
                pipelineCtx.set(shortcutsPipeCtx, shortcuts)

              if (prosePlugins)
                pipelineCtx.set(getProsePluginsPipeCtx, (type, ctx) => prosePlugins(type[id] as NodeType, ctx))

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
