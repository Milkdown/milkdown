/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { MarkSpec, NodeSpec } from '@milkdown/prose';
import { Schema } from '@milkdown/prose';

import type { MarkParserSpec, NodeParserSpec } from '../parser';
import type { MarkSerializerSpec, NodeSerializerSpec } from '../serializer';
import { Atom } from '../utility';
import { InitReady } from '.';

export const SchemaReady = createTimer('schemaReady');

export const schemaCtx = createSlice<Schema>({} as Schema, 'schema');
export const schemaTimerCtx = createSlice<Timer[]>([], 'schemaTimer');

export type NodeSchema = {
    readonly id: string;
    readonly toMarkdown: NodeSerializerSpec;
    readonly parseMarkdown: NodeParserSpec;
} & Readonly<NodeSpec>;

export const nodesCtx = createSlice<NodeSchema[]>([], 'nodes');

export type MarkSchema = {
    readonly id: string;
    readonly toMarkdown: MarkSerializerSpec;
    readonly parseMarkdown: MarkParserSpec;
} & Readonly<MarkSpec>;
export const marksCtx = createSlice<MarkSchema[]>([], 'marks');

export const schema: MilkdownPlugin = (pre) => {
    pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx).inject(schemaTimerCtx, [InitReady]).record(SchemaReady);

    return async (ctx) => {
        await ctx.waitTimers(schemaTimerCtx);

        const getAtom = <T extends Atom>(x: T[]) => Object.fromEntries(x.map(({ id, ...schema }) => [id, schema]));

        const nodes = getAtom(ctx.get(nodesCtx));
        const marks = getAtom(ctx.get(marksCtx));

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
