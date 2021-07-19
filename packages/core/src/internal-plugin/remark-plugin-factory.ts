import type { Plugin } from 'unified';
import { createCtx, MilkdownPlugin } from '..';

export const remarkPluginsCtx = createCtx<Plugin<never, never>[]>([]);

export const remarkPluginFactory =
    (plugin: Plugin | Plugin[]): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const plugins = [plugin].flat();
            ctx.update(remarkPluginsCtx, (prev) => prev.concat(plugins));
        };
    };
