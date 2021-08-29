/* Copyright 2021, Milkdown by Mirone. */
import type { Node as ProsemirrorNode } from 'prosemirror-model';

import { createCtx } from '../context';
import { createSerializer } from '../serializer';
import { createTimer, Timer } from '../timing';
import { MilkdownPlugin } from '../utility';
import { marksCtx, nodesCtx, remarkCtx, schemaCtx } from '.';
import { SchemaReady } from './schema';

export const serializerCtx = createCtx<(node: ProsemirrorNode) => string>(() => '');
export const serializerTimerCtx = createCtx<Timer[]>([]);

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
        const spec = Object.fromEntries(children.map((child) => [child.id, child.serializer]));

        ctx.set(serializerCtx, createSerializer(schema, spec, remark));
        ctx.done(SerializerReady);
    };
};
