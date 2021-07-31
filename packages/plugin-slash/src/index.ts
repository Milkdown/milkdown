import { createCtx, Initialize, MilkdownPlugin, prosePluginsCtx } from '@milkdown/core';
import { config } from './config';
import { WrappedAction } from './item';
import { slashPlugin } from './slash-plugin';

export { createDropdownItem, nodeExists } from './utility';

export const slashCtx = createCtx<WrappedAction[]>([]);

export const slash: MilkdownPlugin = (pre) => {
    pre.inject(slashCtx, config);

    return async (ctx) => {
        await ctx.wait(Initialize);
        ctx.update(prosePluginsCtx, (prev) => prev.concat([slashPlugin(ctx.get(slashCtx))].flat()));
    };
};
