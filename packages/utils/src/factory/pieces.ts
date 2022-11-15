/* Copyright 2021, Milkdown by Mirone. */
import type {
  CmdTuple,
  Ctx,
  MarkSchema,
  NodeSchema,
  RemarkPlugin,
} from '@milkdown/core'
import {
  InitReady,
  SchemaReady,
  ThemeReady,
  commandsCtx,
  createSlice,
  inputRulesCtx,
  markViewCtx,
  marksCtx,
  nodeViewCtx,
  nodesCtx,
  prosePluginsCtx,
  remarkPluginsCtx,
  schemaCtx,
} from '@milkdown/core'
import type { InputRule } from '@milkdown/prose/inputrules'
import { keymap } from '@milkdown/prose/keymap'
import type { MarkType, NodeType } from '@milkdown/prose/model'
import type { Plugin } from '@milkdown/prose/state'
import type { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view'

import type { AnySlice, CommandConfig, CommonOptions } from '../types'
import type { Pipeline } from './pipeline'

export type PluginOptions = Omit<CommonOptions<string, unknown>, 'view'> & { view?: (ctx: Ctx) => PluginView }
export const optionsPipeCtx = createSlice<PluginOptions>({}, 'optionsPipeCtx')

export type UserSchema = (ctx: Ctx) => {
  node?: Record<string, NodeSchema>
  mark?: Record<string, MarkSchema>
}

export type PluginType = Record<string, NodeType | MarkType>

export type PluginView = Record<string, NodeViewConstructor | MarkViewConstructor>

type Maybe<T> = T | undefined

export const injectSlicesPipeCtx = createSlice<AnySlice[]>([], 'injectPipeCtx')
export const injectSlices: Pipeline = async (env, next) => {
  const { pipelineCtx, onCleanup, pre } = env
  const inject = pipelineCtx.get(injectSlicesPipeCtx)
  if (inject) {
    inject.forEach(slice => pre.inject(slice))
    onCleanup((post) => {
      inject.forEach(slice => post.remove(slice))
    })
  }
  await next()
}

export const waitThemeReady: Pipeline = async (env, next) => {
  const { ctx } = env
  await ctx.wait(ThemeReady)

  await next()
}

export const getRemarkPluginsPipeCtx = createSlice<Maybe<(ctx: Ctx) => RemarkPlugin[]>>(
  undefined,
'getRemarkPluginsPipeCtx',
)
export const applyRemarkPlugins: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env

  await ctx.wait(InitReady)

  const remarkPlugins = pipelineCtx.get(getRemarkPluginsPipeCtx)

  if (remarkPlugins) {
    const plugins = remarkPlugins(ctx)

    ctx.update(remarkPluginsCtx, ps => ps.concat(plugins))

    onCleanup(() => {
      ctx.update(remarkPluginsCtx, ps => ps.filter(p => !plugins.includes(p)))
    })
  }

  await next()
}

export const getSchemaPipeCtx = createSlice<Maybe<UserSchema>>(undefined, 'getSchemaPipeCtx')
export const typePipeCtx = createSlice<PluginType, 'Type'>({} as PluginType, 'Type')
export const applySchema: Pipeline = async (env, next) => {
  const { ctx, pipelineCtx, onCleanup } = env

  const getSchema = pipelineCtx.get(getSchemaPipeCtx)

  const userSchema = getSchema?.(env.ctx) ?? {}

  let node: Record<string, NodeSchema> = {}
  let mark: Record<string, MarkSchema> = {}

  if (userSchema.node) {
    node = userSchema.node
    const nodes = Object.entries<NodeSchema>(userSchema.node)
    ctx.update(nodesCtx, ns => [...ns, ...nodes])
    onCleanup(() => {
      ctx.update(nodesCtx, ns => ns.filter(n => !nodes.includes(n)))
    })
  }

  if (userSchema.mark) {
    mark = userSchema.mark
    const marks = Object.entries<MarkSchema>(userSchema.mark)
    ctx.update(marksCtx, ms => [...ms, ...marks])
    onCleanup(() => {
      ctx.update(marksCtx, ms => ms.filter(m => !marks.includes(m)))
    })
  }

  await ctx.wait(SchemaReady)

  const schema = ctx.get(schemaCtx)
  const nodeTypes = Object.keys(node).map(id => [id, schema.nodes[id]] as const)
  const markTypes = Object.keys(mark).map(id => [id, schema.marks[id]] as const)

  const type = Object.fromEntries([...nodeTypes, ...markTypes])
  pipelineCtx.set(typePipeCtx, type)

  await next()
}

export const getCommandsPipeCtx = createSlice<Maybe<(types: PluginType, ctx: Ctx) => CmdTuple[]>>(
  undefined,
'getCommandsPipeCtx',
)
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

export const getInputRulesPipeCtx = createSlice<Maybe<(types: PluginType, ctx: Ctx) => InputRule[]>>(
  undefined,
'getInputRulesPipeCtx',
)
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

export const shortcutsPipeCtx = createSlice<Record<string, CommandConfig>>({}, 'shortcutsPipeCtx')
export const createShortcuts: Pipeline = async (env, next) => {
  const { pipelineCtx, ctx, onCleanup } = env

  const shortcuts = pipelineCtx.get(shortcutsPipeCtx)

  const options = pipelineCtx.get(optionsPipeCtx)
  const getKey = (key: string, defaultValue: string | string[]): string | string[] => {
    return options?.keymap?.[key] ?? defaultValue
  }

  const tuples = Object.entries<CommandConfig>(shortcuts)
    .flatMap(([id, [commandKey, defaultKey, args]]) => {
      const runner = () => ctx.get(commandsCtx).call(commandKey, args)
      const key = getKey(id, defaultKey)
      if (Array.isArray(key))
        return key.map(k => ({ key: k, runner }))

      return { key, runner }
    })
    .map(x => [x.key, x.runner] as [string, () => boolean])

  const plugin = keymap(Object.fromEntries(tuples))
  ctx.update(prosePluginsCtx, ps => ps.concat(plugin))
  onCleanup(() => {
    ctx.update(prosePluginsCtx, ps => ps.filter(p => p !== plugin))
  })

  await next()
}

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

export const getViewPipeCtx = createSlice<Maybe<(ctx: Ctx) => PluginView>>(undefined, 'getViewPipeCtx')
export const applyView: Pipeline = async (env, next) => {
  const { pipelineCtx, ctx, onCleanup } = env

  const getView = pipelineCtx.get(getViewPipeCtx)

  const options = pipelineCtx.get(optionsPipeCtx)

  const view = options.view ? options.view(ctx) : getView?.(ctx)

  if (view) {
    const nodeViews = Object.entries(view).filter(
      ([id]) => ctx.get(nodesCtx).findIndex(ns => ns[0] === id) !== -1,
    )
    const markViews = Object.entries(view).filter(
      ([id]) => ctx.get(marksCtx).findIndex(ns => ns[0] === id) !== -1,
    )
    ctx.update(nodeViewCtx, v => [...v, ...(nodeViews as [string, NodeViewConstructor][])])
    ctx.update(markViewCtx, v => [...v, ...(markViews as [string, MarkViewConstructor][])])

    onCleanup(() => {
      ctx.update(nodeViewCtx, v => v.filter(x => !nodeViews.includes(x)))
      ctx.update(markViewCtx, v => v.filter(x => !markViews.includes(x)))
    })
  }

  await next()
}

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
