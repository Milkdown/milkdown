/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { Node as ProsemirrorNode } from '@milkdown/prose/model'
import { createSerializer } from '@milkdown/transformer'

import { remarkCtx } from './init'
import { SchemaReady, marksCtx, nodesCtx, schemaCtx } from './schema'

export const serializerCtx = createSlice<(node: ProsemirrorNode) => string, 'serializer'>(() => '', 'serializer')
export const serializerTimerCtx = createSlice([] as Timer[], 'serializerTimer')

export const SerializerReady = createTimer('SerializerReady')

export const serializer: MilkdownPlugin = (pre) => {
  pre.inject(serializerCtx).inject(serializerTimerCtx, [SchemaReady]).record(SerializerReady)

  return async (ctx) => {
    await ctx.waitTimers(serializerTimerCtx)
    const nodes = ctx.get(nodesCtx)
    const marks = ctx.get(marksCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    const children = [...nodes, ...marks]
    const spec = Object.fromEntries(children.map(([id, child]) => [id, child.toMarkdown]))

    ctx.set(serializerCtx, createSerializer(schema, spec, remark))
    ctx.done(SerializerReady)

    return (post) => {
      post.remove(serializerCtx).remove(serializerTimerCtx).clearTimer(SerializerReady)
    }
  }
}
