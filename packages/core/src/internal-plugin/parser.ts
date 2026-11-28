import type { MilkdownPlugin, TimerType } from '@milkdown/ctx'
import type { Parser } from '@milkdown/transformer'

import { createSlice, createTimer } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import { ParserState } from '@milkdown/transformer'

import { parsedSourcesCtx, withMeta } from '../__internal__'
import { remarkCtx } from './atoms'
import { preserveSourceCtx, sourceParserCtx } from './markdown-source'
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
    .inject(preserveSourceCtx, false)
    // A new map for each editor.
    .inject(parsedSourcesCtx, new WeakMap())
    .inject(sourceParserCtx)
    .inject(parserTimerCtx, [SchemaReady])
    .record(ParserReady)

  return async () => {
    await ctx.waitTimers(parserTimerCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)
    const preserveSource = ctx.get(preserveSourceCtx)
    const sources = ctx.get(parsedSourcesCtx)

    const parse = ParserState.create(schema, remark)
    // With source preservation on, the parser remembers the text of every
    // document it makes. Otherwise it is the plain parser, and it keeps
    // nothing.
    ctx.set(
      parserCtx,
      preserveSource
        ? (text) => {
            const doc = parse(text)
            // Code without types can pass something that is not a string,
            // and remark reads it as a file. That is no markdown to keep.
            if (typeof text === 'string')
              sources.set(doc, { source: text, doc })
            return doc
          }
        : parse
    )
    ctx.set(sourceParserCtx, (markdown) => {
      // Read the slice on every call, so a parser that a plugin replaced
      // or wrapped is the one that runs.
      const doc = ctx.get(parserCtx)(markdown)
      if (!preserveSource || typeof markdown !== 'string')
        return { doc, source: null }

      // A parser from a plugin may give a document that was not recorded.
      let source = sources.get(doc)
      if (!source) {
        source = { source: markdown, doc }
        sources.set(doc, source)
      }
      return { doc, source }
    })
    ctx.done(ParserReady)
    return () => {
      ctx
        .remove(parserCtx)
        .remove(preserveSourceCtx)
        .remove(parsedSourcesCtx)
        .remove(sourceParserCtx)
        .remove(parserTimerCtx)
        .clearTimer(ParserReady)
    }
  }
}

withMeta(parser, {
  displayName: 'Parser',
})
