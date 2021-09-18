/* Copyright 2021, Milkdown by Mirone. */
import type { Node as ProsemirrorNode } from 'prosemirror-model';

import { createSlice } from '../context';
import { createParser, InnerParserSpecMap, ParserSpecWithType } from '../parser';
import { createTimer, Timer } from '../timing';
import { MilkdownPlugin } from '../utility';
import { remarkCtx } from './init';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export type Parser = (text: string) => ProsemirrorNode | null;

export const parserCtx = createSlice<Parser>(() => null);
export const parserTimerCtx = createSlice<Timer[]>([]);

export const ParserReady = createTimer('ParserReady');

export const parser: MilkdownPlugin = (pre) => {
    pre.inject(parserCtx).inject(parserTimerCtx, [SchemaReady]).record(ParserReady);

    return async (ctx) => {
        await ctx.waitTimers(parserTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const remark = ctx.get(remarkCtx);
        const schema = ctx.get(schemaCtx);

        const children = [
            ...nodes.map((node) => ({ ...node, is: 'node' as const })),
            ...marks.map((mark) => ({ ...mark, is: 'mark' as const })),
        ];
        const spec: InnerParserSpecMap = Object.fromEntries(
            children.map(({ id, parser, is }) => [id, { ...parser, is, key: id } as ParserSpecWithType]),
        );

        ctx.set(parserCtx, createParser(schema, spec, remark));
        ctx.done(ParserReady);
    };
};
