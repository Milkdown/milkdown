import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { Serializer } from '@milkdown/transformer'
import { SerializerState } from '@milkdown/transformer'

import { ctxCallOutOfScope } from '@milkdown/exception'
import { withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
import { SchemaReady, schemaCtx } from './schema'

/// The timer which will be resolved when the serializer plugin is ready.
export const SerializerReady = createTimer('SerializerReady')

/// A slice which stores timers that need to be waited for before starting to run the plugin.
/// By default, it's `[SchemaReady]`.
export const serializerTimerCtx = createSlice(
  [] as TimerType[],
  'serializerTimer'
)

const outOfScope = (() => {
  throw ctxCallOutOfScope()
}) as Serializer

/// A slice which contains the serializer.
export const serializerCtx = createSlice<Serializer, 'serializer'>(
  outOfScope,
  'serializer'
)

/// The serializer plugin.
/// This plugin will create a serializer.
///
/// This plugin will wait for the schema plugin.
export const serializer: MilkdownPlugin = (ctx) => {
  ctx
    .inject(serializerCtx, outOfScope)
    .inject(serializerTimerCtx, [SchemaReady])
    .record(SerializerReady)

  return async () => {
    await ctx.waitTimers(serializerTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    ctx.set(serializerCtx, SerializerState.create(schema, remark))
    ctx.done(SerializerReady)

    return () => {
      ctx
        .remove(serializerCtx)
        .remove(serializerTimerCtx)
        .clearTimer(SerializerReady)
    }
  }
}

withMeta(serializer, {
  displayName: 'Serializer',
})
