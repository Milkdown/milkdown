/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { ViewFactory, ViewParams } from '@milkdown/prose';

import { Atom, getAtom } from '../utility';
import { marksCtx } from './mark-factory';
import { nodesCtx } from './node-factory';
import { schemaCtx, SchemaReady } from './schema';

export const nodeViewCtx = createSlice<Record<string, ViewFactory>>({}, 'nodeView');
export const nodeViewTimerCtx = createSlice<Timer[]>([], 'nodeViewTimer');

export const NodeViewReady = createTimer('NodeViewReady');

export const nodeView: MilkdownPlugin = (pre) => {
    pre.inject(nodeViewCtx).inject(nodeViewTimerCtx, [SchemaReady]).record(NodeViewReady);

    return async (ctx) => {
        await ctx.waitTimers(nodeViewTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);

        const getViewMap = <T extends Atom>(atoms: T[], isNode: boolean) =>
            atoms
                .map(
                    ({ id, view }) =>
                        [getAtom(id, schema, isNode), { view: view as ViewFactory | undefined, id }] as const,
                )
                .map(([atom, { id, view }]) =>
                    atom && view ? [id, ((...args: ViewParams) => view(...args)) as ViewFactory] : undefined,
                )
                .filter((x): x is [string, ViewFactory] => !!x);

        const nodeViewMap = getViewMap(nodes, true);

        const markViewMap = getViewMap(marks, false);

        const nodeView = Object.fromEntries([...nodeViewMap, ...markViewMap]);

        ctx.set(nodeViewCtx, nodeView);
        ctx.done(NodeViewReady);
    };
};
