import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import type { Parser } from '@milkdown/transformer'

import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import { ParserState } from '@milkdown/transformer'

import { withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
import { SchemaReady, schemaCtx } from './schema'

/// The timer which will be resolved when the parser plugin is ready.
export const ParserReady = createTimer('ParserReady')

const outOfScope = (() => {
  throw ctxCallOutOfScope()
}) as Parser

/// A slice which contains the parser.
export const parserCtx = createSlice(outOfScope, 'parser')

/// A slice that holds the timers to wait for before the plugin
/// runs. It defaults to `[SchemaReady]`.
export const parserTimerCtx = createSlice([] as TimerType[], 'parserTimer')

/// The parser plugin.
/// This plugin will create a parser.
///
/// This plugin waits for the schema plugin.
export const parser: MilkdownPlugin = (ctx) => {
  ctx
    .inject(parserCtx, outOfScope)
    .inject(parserTimerCtx, [SchemaReady])
    .record(ParserReady)

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

withMeta(parser, {
  displayName: 'Parser',
})
