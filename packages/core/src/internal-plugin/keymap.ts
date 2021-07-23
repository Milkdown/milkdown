import type { Keymap } from 'prosemirror-commands';
import { keymap as proseKeymap } from 'prosemirror-keymap';
import type { Plugin as ProsePlugin } from 'prosemirror-state';
import { createCtx } from '../context';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { createTimer, Timer } from '../timing';
import { Atom, getAtom, MilkdownPlugin } from '../utility';

export const keymapCtx = createCtx<ProsePlugin[]>([]);
export const keymapTimerCtx = createCtx<Timer[]>([]);

export const KeymapReady = createTimer('KeymapReady');

export const keymap: MilkdownPlugin = (pre) => {
    pre.inject(keymapCtx).inject(keymapTimerCtx, [SchemaReady]).record(KeymapReady);

    return async (ctx) => {
        await Promise.all(ctx.get(keymapTimerCtx).map((x) => ctx.wait(x)));

        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);

        const getKeymap = <T extends Atom>(atoms: T[], isNode: boolean): ProsePlugin[] =>
            atoms
                .map((x) => [getAtom(x.id, schema, isNode), x.keymap] as const)
                .map(([atom, keymap]) => atom && keymap?.(atom, schema))
                .filter((x): x is Keymap => !!x)
                .map(proseKeymap);

        const nodesKeymap = getKeymap(nodes, true);
        const marksKeymap = getKeymap(marks, false);

        const keymapList = [...nodesKeymap, ...marksKeymap];

        ctx.set(keymapCtx, keymapList);
        ctx.done(KeymapReady);
    };
};
