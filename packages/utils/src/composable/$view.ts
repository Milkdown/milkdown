/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, SchemaReady, viewCtx } from '@milkdown/core';
import { MarkViewFactory, NodeViewFactory, ViewFactory } from '@milkdown/prose';

import { $Mark, $Node } from '.';

export type $View<T extends $Node | $Mark, V extends NodeViewFactory | MarkViewFactory> = MilkdownPlugin & {
    view: V;
    type: T;
};

export const $view = <
    T extends $Node | $Mark,
    V extends NodeViewFactory | MarkViewFactory = T extends $Node
        ? NodeViewFactory
        : T extends $Mark
        ? MarkViewFactory
        : ViewFactory,
>(
    type: T,
    view: (ctx: Ctx) => V,
): $View<T, V> => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const v = view(ctx);
        ctx.update(viewCtx, (ps) => [...ps, [type.id, v] as [string, ViewFactory]]);
        (<$View<T, V>>plugin).view = v;
        (<$View<T, V>>plugin).type = type;
    };

    return <$View<T, V>>plugin;
};
