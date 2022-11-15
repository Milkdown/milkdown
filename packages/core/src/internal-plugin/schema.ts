/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { MarkSpec, NodeSpec } from '@milkdown/prose/model'
import { Schema } from '@milkdown/prose/model'
import type {
  MarkParserSpec,
  MarkSerializerSpec,
  NodeParserSpec,
  NodeSerializerSpec,
  RemarkParser,
} from '@milkdown/transformer'

import { InitReady, remarkCtx, remarkPluginsCtx } from '.'

export const SchemaReady = createTimer('schemaReady')

export const schemaCtx = createSlice({} as Schema, 'schema')
export const schemaTimerCtx = createSlice([] as Timer[], 'schemaTimer')

export type NodeSchema = {
  readonly toMarkdown: NodeSerializerSpec
  readonly parseMarkdown: NodeParserSpec
  readonly priority?: number
} & Readonly<NodeSpec>

export const nodesCtx = createSlice([] as Array<[string, NodeSchema]>, 'nodes')

export type MarkSchema = {
  readonly toMarkdown: MarkSerializerSpec
  readonly parseMarkdown: MarkParserSpec
} & Readonly<MarkSpec>
export const marksCtx = createSlice([] as Array<[string, MarkSchema]>, 'marks')

const extendPriority = <T extends NodeSchema | MarkSchema>(x: T): T => {
  return {
    ...x,
    parseDOM: x.parseDOM?.map(rule => ({ priority: x.priority, ...rule })),
  }
}

export const schema: MilkdownPlugin = (pre) => {
  pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx).inject(schemaTimerCtx, [InitReady]).record(SchemaReady)

  return async (ctx) => {
    await ctx.waitTimers(schemaTimerCtx)

    const remark = ctx.get(remarkCtx)
    const remarkPlugins = ctx.get(remarkPluginsCtx)

    const processor = remarkPlugins.reduce((acc: RemarkParser, plug) => acc.use(plug), remark)
    ctx.set(remarkCtx, processor)

    const nodes = Object.fromEntries(ctx.get(nodesCtx).map(([key, x]) => [key, extendPriority(x)]))
    const marks = Object.fromEntries(ctx.get(marksCtx).map(([key, x]) => [key, extendPriority(x)]))

    ctx.set(
      schemaCtx,
      new Schema({
        nodes,
        marks,
      }),
    )

    ctx.done(SchemaReady)

    return (post) => {
      post.remove(schemaCtx).remove(nodesCtx).remove(marksCtx).remove(schemaTimerCtx).clearTimer(SchemaReady)
    }
  }
}
