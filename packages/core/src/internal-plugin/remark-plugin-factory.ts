import type { Plugin } from 'unified';
import { createCtx } from '../context';
import type { MilkdownPlugin } from '../utility';

export const remarkPluginsCtx = createCtx<Plugin<never, never>[]>([]);

export const remarkPluginFactory =
    (plugin: Plugin | Plugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        ctx.update(remarkPluginsCtx, (prev) => prev.concat([plugin].flat()));
    };
