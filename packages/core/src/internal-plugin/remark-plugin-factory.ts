import type { Plugin } from 'unified';
import { createCtx, MilkdownPlugin } from '..';

export const remarkPluginsCtx = createCtx<Plugin<never, never>[]>([]);

export const remarkPluginFactory =
    (plugin: Plugin | Plugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
