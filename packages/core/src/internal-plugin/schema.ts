/* Copyright 2021, Milkdown by Mirone. */
import { Schema } from 'prosemirror-model';

import { createSlice } from '../context';
import { Initialize, Mark, Node } from '../internal-plugin';
import { createTimer, Timer } from '../timing';
import { Atom, MilkdownPlugin } from '../utility';

export const SchemaReady = createTimer('schemaReady');

export const schemaCtx = createSlice<Schema>({} as Schema);
export const nodesCtx = createSlice<Node[]>([]);
export const marksCtx = createSlice<Mark[]>([]);
export const schemaTimerCtx = createSlice<Timer[]>([]);

export const schema: MilkdownPlugin = (pre) => {
    pre.inject(schemaCtx).inject(nodesCtx).inject(marksCtx).inject(schemaTimerCtx, [Initialize]).record(SchemaReady);

    return async (ctx) => {
        await ctx.waitTimers(schemaTimerCtx);

        const getAtom = <T extends Atom>(x: T[]) =>
            Object.fromEntries<T['schema']>(x.map(({ id, schema }) => [id, schema]));

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
