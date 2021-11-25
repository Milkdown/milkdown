/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { Node as ProsemirrorNode } from '@milkdown/prose';
import { createSerializer } from '@milkdown/transformer';

import { remarkCtx } from './init';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export const serializerCtx = createSlice<(node: ProsemirrorNode) => string>(() => '', 'serializer');
export const serializerTimerCtx = createSlice<Timer[]>([], 'serializerTimer');

export const SerializerReady = createTimer('SerializerReady');

export const serializer: MilkdownPlugin = (pre) => {
    pre.inject(serializerCtx).inject(serializerTimerCtx, [SchemaReady]).record(SerializerReady);

    return async (ctx) => {
        await ctx.waitTimers(serializerTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const remark = ctx.get(remarkCtx);
        const schema = ctx.get(schemaCtx);

        const children = [...nodes, ...marks];
        const spec = Object.fromEntries(children.map(([id, child]) => [id, child.toMarkdown]));

        ctx.set(serializerCtx, createSerializer(schema, spec, remark));
        ctx.done(SerializerReady);
    };
};
