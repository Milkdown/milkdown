/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, editorStateTimerCtx, MilkdownPlugin, prosePluginsCtx, SchemaReady } from '@milkdown/core';
import { Plugin } from '@milkdown/prose/state';

import { addTimer } from './utils';

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

export const $proseAsync = (prose: (ctx: Ctx) => Promise<Plugin>, timerName?: string) => {
    return addTimer<$Prose>(
        async (ctx, plugin) => {
            await ctx.wait(SchemaReady);
            const prosePlugin = await prose(ctx);
            ctx.update(prosePluginsCtx, (ps) => [...ps, prosePlugin]);
            plugin.plugin = prosePlugin;
        },
        editorStateTimerCtx,
        timerName,
    );
};
