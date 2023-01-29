/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { Node as ProsemirrorNode } from '@milkdown/prose/model'
import { createSerializer } from '@milkdown/transformer'

import { remarkCtx } from './init'
import { SchemaReady, schemaCtx } from './schema'

export const serializerCtx = createSlice<(node: ProsemirrorNode) => string, 'serializer'>(() => '', 'serializer')
export const serializerTimerCtx = createSlice([] as TimerType[], 'serializerTimer')

export const SerializerReady = createTimer('SerializerReady')

export const serializer: MilkdownPlugin = (ctx) => {
  ctx.inject(serializerCtx).inject(serializerTimerCtx, [SchemaReady]).record(SerializerReady)

  return async () => {
    await ctx.waitTimers(serializerTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    ctx.set(serializerCtx, createSerializer(schema, remark))
    ctx.done(SerializerReady)

    return () => {
      ctx.remove(serializerCtx).remove(serializerTimerCtx).clearTimer(SerializerReady)
    }
  }
}
