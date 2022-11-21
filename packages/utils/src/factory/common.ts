/* Copyright 2021, Milkdown by Mirone. */
import type { CmdKey, MilkdownPlugin } from '@milkdown/core'
import { pipe } from '../pipe'

import type {
  AddMetadata,
  CommandConfig,
  CommonOptions,
  Factory,
  GetPlugin,
  WithExtend,
} from '../types'
import { applyProsePlugins, applyRemarkPlugins, applySchema, applyView, createCommands, createInputRules, createShortcuts, injectPipeEnv, injectSlices } from './pieces'
import type { Pipeline } from './pipeline'
import { run } from './pipeline'

export const createShortcut = <T>(commandKey: CmdKey<T>, defaultKey: string | string[], args?: T) =>
  [commandKey, defaultKey, args] as CommandConfig<unknown>

export const addMetadata = <SupportedKeys extends string = string, Options extends {} = {}>(
  x: GetPlugin<SupportedKeys, Options>,
): AddMetadata<SupportedKeys, Options> => {
  const fn: AddMetadata<SupportedKeys, Options> = (options) => {
    const result = x(options) as ReturnType<AddMetadata<SupportedKeys, Options>>
    result.origin = fn
    return result
  }
  return fn
}

export const withExtend
  = <SupportedKeys extends string, Options extends {}, Type, Rest>(
    factory: Factory<SupportedKeys, Options, Type, Rest>,
    creator: (
      factory: Factory<SupportedKeys, Options, Type, Rest>,
    ) => WithExtend<SupportedKeys, Options, Type, Rest>,
  ) => (origin: AddMetadata<SupportedKeys, Options>): WithExtend<SupportedKeys, Options, Type, Rest> => {
    type Ext = WithExtend<SupportedKeys, Options, Type, Rest>
    const next = origin as Ext
    const extend = (extendFactory: Parameters<Ext['extend']>[0]) => creator((...args) => extendFactory(factory(...args), ...args))

    next.extend = extend as Ext['extend']

    return next
    }

const innerPlugin = (setPipelineEnv: Pipeline): MilkdownPlugin => pre => async (ctx) => {
  const runner = run([
    injectPipeEnv,
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
}

export type ConfigurePipelineEnv<SupportedKeys extends string, Options extends {}, Type, Rest> = (
  factory: Factory<SupportedKeys, Options, Type, Rest>,
  options?: Partial<CommonOptions<SupportedKeys, Options>>,
) => Pipeline

export const createPluginByEnv = <
  SupportedKeys extends string = string,
  Options extends {} = {},
  Type = unknown,
  Rest = unknown,
>(
    factory: Factory<SupportedKeys, Options, Type, Rest>,
    setPipelineEnv: ConfigurePipelineEnv<SupportedKeys, Options, Type, Rest>,
  ) => (options?: Partial<CommonOptions<SupportedKeys, Options>>) =>
    innerPlugin(setPipelineEnv(factory, options))

export const createPluginByEnvConfig = <SupportedKeys extends string, Options extends {}, Type, Rest>(
  configureEnv: ConfigurePipelineEnv<SupportedKeys, Options, Type, Rest>,
) => {
  const createPlugin = (factory: Factory<SupportedKeys, Options, Type, Rest>): WithExtend<SupportedKeys, Options, Type, Rest> =>
    pipe(addMetadata, withExtend(factory, createPlugin))(createPluginByEnv(factory, configureEnv))

  return createPlugin
}
