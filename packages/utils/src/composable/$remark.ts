/* Copyright 2021, Milkdown by Mirone. */

import { InitReady, MilkdownPlugin, RemarkPlugin, remarkPluginsCtx } from '@milkdown/core';

export type $Remark = MilkdownPlugin & {
    plugin: RemarkPlugin;
};

export const $remark = (remark: RemarkPlugin): $Remark => {
    const plugin: MilkdownPlugin = () => async (ctx) => {
        await ctx.wait(InitReady);
        ctx.update(remarkPluginsCtx, (rp) => [...rp, remark]);
        (<$Remark>plugin).plugin = remark;
    };

    return <$Remark>plugin;
};
