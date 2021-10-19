/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';

import { Atom, getAtom, ProseView, ViewFactory, ViewParams } from '../utility';
import { editorCtx } from './init';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from './schema';

export const nodeViewCtx = createSlice<Record<string, ProseView>>({}, 'nodeView');
export const nodeViewTimerCtx = createSlice<Timer[]>([], 'nodeViewTimer');

export const NodeViewReady = createTimer('NodeViewReady');

export const nodeView: MilkdownPlugin = (pre) => {
    pre.inject(nodeViewCtx).inject(nodeViewTimerCtx, [SchemaReady]).record(NodeViewReady);

    return async (ctx) => {
        await ctx.waitTimers(nodeViewTimerCtx);
        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);
        const editor = ctx.get(editorCtx);

        const getViewMap = <T extends Atom>(atoms: T[], isNode: boolean) =>
            atoms
                .map(
                    ({ id, view }) =>
                        [getAtom(id, schema, isNode), { view: view as ViewFactory | undefined, id }] as const,
                )
                .map(([atom, { id, view }]) =>
                    atom && view
                        ? [id, ((...args: ViewParams) => view(editor, atom, ...args)) as ProseView]
                        : undefined,
                )
                .filter((x): x is [string, ProseView] => !!x);

        const nodeViewMap = getViewMap(nodes, true);

        const markViewMap = getViewMap(marks, false);

        const nodeView = Object.fromEntries([...nodeViewMap, ...markViewMap]);

        ctx.set(nodeViewCtx, nodeView);
        ctx.done(NodeViewReady);
    };
};
