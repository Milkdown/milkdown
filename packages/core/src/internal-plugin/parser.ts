/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import type { Parser } from '@milkdown/transformer'
import { ParserState } from '@milkdown/transformer'

import { remarkCtx } from './init'
import { SchemaReady, schemaCtx } from './schema'

export const parserCtx = createSlice((() => {
  throw ctxCallOutOfScope()
}) as Parser, 'parser')
export const parserTimerCtx = createSlice([] as TimerType[], 'parserTimer')

export const ParserReady = createTimer('ParserReady')

export const parser: MilkdownPlugin = (ctx) => {
  ctx.inject(parserCtx).inject(parserTimerCtx, [SchemaReady]).record(ParserReady)

  return async () => {
    await ctx.waitTimers(parserTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    ctx.set(parserCtx, ParserState.create(schema, remark))
    ctx.done(ParserReady)
    return () => {
      ctx.remove(parserCtx).remove(parserTimerCtx).clearTimer(ParserReady)
    }
  }
}
