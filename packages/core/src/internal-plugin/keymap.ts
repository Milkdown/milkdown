/* Copyright 2021, Milkdown by Mirone. */
import type { Keymap } from 'prosemirror-commands';
import { keymap as proseKeymap } from 'prosemirror-keymap';
import type { Plugin as ProsePlugin } from 'prosemirror-state';

import { createCtx } from '../context';
import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { createTimer, Timer } from '../timing';
import { Atom, getAtom, MilkdownPlugin } from '../utility';
import { commandsCtx, CommandsReady } from './commands';

export const keymapCtx = createCtx<ProsePlugin[]>([]);
export const keymapTimerCtx = createCtx<Timer[]>([]);

export const KeymapReady = createTimer('KeymapReady');

export const keymap: MilkdownPlugin = (pre) => {
    pre.inject(keymapCtx).inject(keymapTimerCtx, [SchemaReady, CommandsReady]).record(KeymapReady);

    return async (ctx) => {
        await ctx.waitTimers(keymapTimerCtx);

        const nodes = ctx.get(nodesCtx);
        const marks = ctx.get(marksCtx);
        const schema = ctx.get(schemaCtx);
        const commandManager = ctx.get(commandsCtx);

        const getKeymap = <T extends Atom>(atoms: T[], isNode: boolean): ProsePlugin[] =>
            atoms
                .map((x) => [getAtom(x.id, schema, isNode), x.keymap] as const)
                .map(([atom, keymap]) => atom && keymap?.(atom, schema, commandManager.get))
                .filter((x): x is Keymap => !!x)
                .map(proseKeymap);

        const nodesKeymap = getKeymap(nodes, true);
        const marksKeymap = getKeymap(marks, false);

        const keymapList = [...nodesKeymap, ...marksKeymap];

        ctx.set(keymapCtx, keymapList);
        ctx.done(KeymapReady);
    };
};
