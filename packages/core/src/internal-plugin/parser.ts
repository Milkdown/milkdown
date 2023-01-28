/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { Node } from '@milkdown/prose/model'
import { createParser } from '@milkdown/transformer'

import { remarkCtx } from './init'
import { SchemaReady, schemaCtx } from './schema'

export type Parser = (text: string) => Node | undefined

export const parserCtx = createSlice((() => undefined) as Parser, 'parser')
export const parserTimerCtx = createSlice([] as Timer[], 'parserTimer')

export const ParserReady = createTimer('ParserReady')

export const parser: MilkdownPlugin = (pre) => {
  pre.inject(parserCtx).inject(parserTimerCtx, [SchemaReady]).record(ParserReady)

  return async (ctx) => {
    await ctx.waitTimers(parserTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    ctx.set(parserCtx, createParser(schema, remark))
    ctx.done(ParserReady)
    return (post) => {
      post.remove(parserCtx).remove(parserTimerCtx).clearTimer(ParserReady)
    }
  }
}
