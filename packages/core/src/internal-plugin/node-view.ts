/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, Ctx, MilkdownPlugin, Timer } from '@milkdown/ctx';
import { MarkViewFactory, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { SchemaReady } from './schema';

type View = [nodeId: string, view: ViewFactory | NodeViewFactory | MarkViewFactory];
export const viewCtx = createSlice<View[]>([], 'nodeView');
export const viewTimerCtx = createSlice<Timer[]>([], 'nodeViewTimer');

export const viewReady = createTimer('NodeViewReady');

export const viewFactory =
    (getView: (ctx: Ctx) => View): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const view = getView(ctx);
            ctx.update(viewCtx, (views) => [...views, view]);
        };
    };

export const nodeView: MilkdownPlugin = (pre) => {
    pre.inject(viewCtx).inject(viewTimerCtx, [SchemaReady]).record(viewReady);

    return async (ctx) => {
        await ctx.waitTimers(viewTimerCtx);

        ctx.done(viewReady);
    };
};
