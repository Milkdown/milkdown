import type { Keymap } from 'prosemirror-commands';
import { keymap as proseKeymap } from 'prosemirror-keymap';
import type { Plugin as ProsemirrorPlugin } from 'prosemirror-state';
import { SchemaReady } from '../constant';
import { createCtx } from '../context';
import { marksCtx, nodesCtx, schemaCtx } from '../internal-plugin';
import type { MilkdownPlugin } from '../utility';

export const keymapCtx = createCtx<ProsemirrorPlugin[]>([]);

export const keymap: MilkdownPlugin = (editor) => {
    editor.ctx(keymapCtx);

    return async (ctx) => {
        await SchemaReady();

        const nodes = ctx.use(nodesCtx).get();
        const marks = ctx.use(marksCtx).get();
        const schema = ctx.use(schemaCtx).get();

        const nodesKeymap = nodes.map((cur) => {
            const node = schema.nodes[cur.id];
            if (!node) throw new Error();
            return cur.keymap?.(node, schema);
        });
        const marksKeymap = marks.map((cur) => {
            const mark = schema.marks[cur.id];
            if (!mark) throw new Error();
            return cur.keymap?.(mark, schema);
        });

        const keymapList = [...nodesKeymap, ...marksKeymap]
            .filter((keys): keys is Keymap => Boolean(keys))
            .map((keys) => proseKeymap(keys));

        ctx.use(keymapCtx).set(keymapList);
    };
};
