import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import { createCtx, MilkdownPlugin } from '..';

export const prosePluginsCtx = createCtx<ProsemirrorPlugin[]>([]);

export const prosePluginFactory =
    (plugin: ProsemirrorPlugin | ProsemirrorPlugin[]): MilkdownPlugin =>
    () => {
        return (ctx) => {
            const plugins = [plugin].flat();
            ctx.update(prosePluginsCtx, (prev) => prev.concat(plugins));
        };
    };
