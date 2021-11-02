/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { MarkSpec, NodeSpec } from '@milkdown/prose';
import { Schema } from '@milkdown/prose';

import type { MarkParserSpec, NodeParserSpec } from '../parser';
import type { MarkSerializerSpec, NodeSerializerSpec } from '../serializer';
import { InitReady } from '.';

export const SchemaReady = createTimer('schemaReady');

export const schemaCtx = createSlice<Schema>({} as Schema, 'schema');
export const schemaTimerCtx = createSlice<Timer[]>([], 'schemaTimer');

export type NodeSchema = {
    readonly toMarkdown: NodeSerializerSpec;
    readonly parseMarkdown: NodeParserSpec;
} & Readonly<NodeSpec>;

export const nodesCtx = createSlice<[string, NodeSchema][]>([], 'nodes');

export type MarkSchema = {
    readonly toMarkdown: MarkSerializerSpec;
    readonly parseMarkdown: MarkParserSpec;
} & Readonly<MarkSpec>;
export const marksCtx = createSlice<[string, MarkSchema][]>([], 'marks');

export const schema: MilkdownPlugin = (pre) => {
    pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx).inject(schemaTimerCtx, [InitReady]).record(SchemaReady);

    return async (ctx) => {
        await ctx.waitTimers(schemaTimerCtx);

        const nodes = Object.fromEntries(ctx.get(nodesCtx));
        const marks = Object.fromEntries(ctx.get(marksCtx));

        ctx.set(
            schemaCtx,
            new Schema({
                nodes,
                marks,
            }),
        );

        ctx.done(SchemaReady);
    };
};
