/* Copyright 2021, Milkdown by Mirone. */
import type { Plugin } from 'prosemirror-state';

import { createCtx } from '../context';
import type { Ctx, MilkdownPlugin } from '../utility';
import { CommandsReady } from './commands';

export const prosePluginsCtx = createCtx<Plugin[]>([]);

type MaybeList<T> = T | T[];

type PluginFactory = ((ctx: Ctx) => MaybeList<Plugin>) | MaybeList<Plugin>;

export const prosePluginFactory =
    (plugin: PluginFactory): MilkdownPlugin =>
    () =>
    async (ctx) => {
        await ctx.wait(CommandsReady);
        const plugins = typeof plugin === 'function' ? [plugin(ctx)] : [plugin];
        ctx.update(prosePluginsCtx, (prev) => prev.concat(plugins.flat()));
    };
