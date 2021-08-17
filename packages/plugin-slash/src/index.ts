import { CommandsReady, createCtx, Ctx, MilkdownPlugin, prosePluginsCtx } from '@milkdown/core';
import { config } from './config';
import { WrappedAction } from './item';
import { slashPlugin } from './slash-plugin';

export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (ctx: Ctx) => WrappedAction[];

export const slashCtx = createCtx<SlashConfig>(() => []);

export const slash: MilkdownPlugin = (pre) => {
    pre.inject(slashCtx, config);

    return async (ctx) => {
        await ctx.wait(CommandsReady);
        const config = ctx.get(slashCtx);
        ctx.update(prosePluginsCtx, (prev) => prev.concat([slashPlugin(ctx, config(ctx))].flat()));
    };
};
