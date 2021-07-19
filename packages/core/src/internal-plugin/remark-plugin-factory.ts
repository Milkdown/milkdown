import type { Plugin as RemarkPlugin } from 'unified';
import { createCtx, MilkdownPlugin } from '..';

export const remarkPluginsCtx = createCtx<RemarkPlugin[]>([]);

export const remarkPluginFactory =
    (plugin: RemarkPlugin | RemarkPlugin[]): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const plugins = [plugin].flat();
            ctx.update(remarkPluginsCtx, (prev) => prev.concat(plugins));
        };
    };
