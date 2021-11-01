/* Copyright 2021, Milkdown by Mirone. */

import { createSlice, Ctx, MilkdownPlugin } from '@milkdown/ctx';
import type { ViewFactory } from '@milkdown/prose';

type View = [nodeId: string, view: ViewFactory];
export const viewCtx = createSlice<View[]>([], 'nodeView');

export const viewFactory =
    (getView: (ctx: Ctx) => View): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const view = getView(ctx);
            ctx.update(viewCtx, (views) => views.concat(view));
        };
    };
