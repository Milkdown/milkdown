import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { Schema } from '@milkdown/prose/model'
import type {
  MarkSchema,
  NodeSchema,
  RemarkParser,
} from '@milkdown/transformer'

import { withMeta } from '../__internal__'
import { InitReady } from './init'
import { remarkCtx, remarkPluginsCtx } from './atoms'

/// The timer which will be resolved when the schema plugin is ready.
export const SchemaReady = createTimer('SchemaReady')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[InitReady]`.
export const schemaTimerCtx = createSlice([] as TimerType[], 'schemaTimer')

/// A slice which contains the schema.
export const schemaCtx = createSlice({} as Schema, 'schema')

/// A slice which stores the nodes spec.
export const nodesCtx = createSlice([] as Array<[string, NodeSchema]>, 'nodes')

/// A slice which stores the marks spec.
export const marksCtx = createSlice([] as Array<[string, MarkSchema]>, 'marks')

function extendPriority<T extends NodeSchema | MarkSchema>(x: T): T {
  return {
    ...x,
    parseDOM: x.parseDOM?.map((rule) => ({ priority: x.priority, ...rule })),
  }
}

/// The schema plugin.
/// This plugin will load all nodes spec and marks spec and create a schema.
///
/// This plugin will wait for the init plugin.
export const schema: MilkdownPlugin = (ctx) => {
  ctx
    .inject(schemaCtx, {} as Schema)
    .inject(nodesCtx, [])
    .inject(marksCtx, [])
    .inject(schemaTimerCtx, [InitReady])
    .record(SchemaReady)

  return async () => {
    await ctx.waitTimers(schemaTimerCtx)

    const remark = ctx.get(remarkCtx)
    const remarkPlugins = ctx.get(remarkPluginsCtx)

    const processor = remarkPlugins.reduce(
      (acc: RemarkParser, plug) =>
        acc.use(plug.plugin, plug.options) as unknown as RemarkParser,
      remark
    )
    ctx.set(remarkCtx, processor)

    const nodes = Object.fromEntries(
      ctx.get(nodesCtx).map(([key, x]) => [key, extendPriority(x)])
    )
    const marks = Object.fromEntries(
      ctx.get(marksCtx).map(([key, x]) => [key, extendPriority(x)])
    )
    const schema = new Schema({ nodes, marks })

    ctx.set(schemaCtx, schema)

    ctx.done(SchemaReady)

    return () => {
      ctx
        .remove(schemaCtx)
        .remove(nodesCtx)
        .remove(marksCtx)
        .remove(schemaTimerCtx)
        .clearTimer(SchemaReady)
    }
  }
}

withMeta(schema, {
  displayName: 'Schema',
})
