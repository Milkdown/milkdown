import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import { createCtx, MilkdownPlugin } from '..';

export const prosemirrorPluginsCtx = createCtx<ProsemirrorPlugin[]>([]);

export const prosemirrorFactory =
    (plugin: ProsemirrorPlugin | ProsemirrorPlugin[]): MilkdownPlugin =>
    () =>
    (ctx) => {
        const plugins = [plugin].flat();
        ctx.update(prosemirrorPluginsCtx, (prev) => prev.concat(plugins));
    };
