/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, editorViewTimerCtx, markViewCtx, MilkdownPlugin, nodeViewCtx, SchemaReady } from '@milkdown/core';
import { NodeType } from '@milkdown/prose/model';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';

import { $Mark, $Node } from '.';
import { addTimer } from './utils';

export type $View<T extends $Node | $Mark, V extends NodeViewConstructor | MarkViewConstructor> = MilkdownPlugin & {
    view: V;
    type: T;
};

export const $view = <
    T extends $Node | $Mark,
    V extends NodeViewConstructor | MarkViewConstructor = T extends $Node
        ? NodeViewConstructor
        : T extends $Mark
        ? MarkViewConstructor
        : NodeViewConstructor | MarkViewConstructor,
>(
    type: T,
    view: (ctx: Ctx) => V,
): $View<T, V> => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const v = view(ctx);
        if (type.type instanceof NodeType) {
            ctx.update(nodeViewCtx, (ps) => [...ps, [type.id, v] as [string, NodeViewConstructor]]);
        } else {
            ctx.update(markViewCtx, (ps) => [...ps, [type.id, v] as [string, MarkViewConstructor]]);
        }
        (<$View<T, V>>plugin).view = v;
        (<$View<T, V>>plugin).type = type;
    };

    return <$View<T, V>>plugin;
};

export const $viewAsync = <
    T extends $Node | $Mark,
    V extends NodeViewConstructor | MarkViewConstructor = T extends $Node
        ? NodeViewConstructor
        : T extends $Mark
        ? MarkViewConstructor
        : NodeViewConstructor | MarkViewConstructor,
>(
    type: T,
    view: (ctx: Ctx) => Promise<V>,
    timerName?: string,
) =>
    addTimer<$View<T, V>>(
        async (ctx, plugin) => {
            await ctx.wait(SchemaReady);
            const v = await view(ctx);
            if (type.type instanceof NodeType) {
                ctx.update(nodeViewCtx, (ps) => [...ps, [type.id, v] as [string, NodeViewConstructor]]);
            } else {
                ctx.update(markViewCtx, (ps) => [...ps, [type.id, v] as [string, MarkViewConstructor]]);
            }
            plugin.view = v;
            plugin.type = type;
        },
        editorViewTimerCtx,
        timerName,
    );
