/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin, Timer } from '@milkdown/ctx'
import { createSlice, createTimer } from '@milkdown/ctx'
import type { Node as ProsemirrorNode } from '@milkdown/prose/model'
import type { InnerParserSpecMap, ParserSpecWithType } from '@milkdown/transformer'
import { createParser } from '@milkdown/transformer'

import { remarkCtx } from './init'
import { SchemaReady, schemaCtx } from './schema'
import { marksCtx, nodesCtx } from '.'

export type Parser = (text: string) => ProsemirrorNode | undefined

export const parserCtx = createSlice((() => undefined) as Parser, 'parser')
export const parserTimerCtx = createSlice([] as Timer[], 'parserTimer')

export const ParserReady = createTimer('ParserReady')

export const parser: MilkdownPlugin = (pre) => {
  pre.inject(parserCtx).inject(parserTimerCtx, [SchemaReady]).record(ParserReady)

  return async (ctx) => {
    await ctx.waitTimers(parserTimerCtx)
    const nodes = ctx.get(nodesCtx)
    const marks = ctx.get(marksCtx)
    const remark = ctx.get(remarkCtx)
    const schema = ctx.get(schemaCtx)

    const children = [
      ...nodes.map(([id, v]) => ({ id, ...v })).map(node => ({ ...node, is: 'node' as const })),
      ...marks.map(([id, v]) => ({ id, ...v })).map(mark => ({ ...mark, is: 'mark' as const })),
    ]
    const spec: InnerParserSpecMap = Object.fromEntries(
      children.map(({ id, parseMarkdown, is }) => [id, { ...parseMarkdown, is, key: id } as ParserSpecWithType]),
    )

    ctx.set(parserCtx, createParser(schema, spec, remark))
    ctx.done(ParserReady)
    return (post) => {
      post.remove(parserCtx).remove(parserTimerCtx).clearTimer(ParserReady)
    }
  }
}
