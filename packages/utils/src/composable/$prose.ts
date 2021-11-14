/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, prosePluginsCtx, SchemaReady } from '@milkdown/core';
import { Plugin } from '@milkdown/prose';

export type $Prose = MilkdownPlugin & {
    plugin: Plugin;
};

export const $prose = (prose: (ctx: Ctx) => Plugin): $Prose => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const prosePlugin = prose(ctx);
        ctx.update(prosePluginsCtx, (ps) => [...ps, prosePlugin]);
        (<$Prose>plugin).plugin = prosePlugin;
    };

    return <$Prose>plugin;
};
