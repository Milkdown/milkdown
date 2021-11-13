/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, MilkdownPlugin, prosePluginsCtx, SchemaReady } from '@milkdown/core';
import { Keymap, keymap } from '@milkdown/prose';

export type $Shortcut = MilkdownPlugin & {
    keymap: Keymap;
};

export const $shortcut = (shortcut: (ctx: Ctx) => Keymap): $Shortcut => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(SchemaReady);
        const k = shortcut(ctx);
        ctx.update(prosePluginsCtx, (ps) => [...ps, keymap(k)]);
        (<$Shortcut>plugin).keymap = k;
    };

    return <$Shortcut>plugin;
};
