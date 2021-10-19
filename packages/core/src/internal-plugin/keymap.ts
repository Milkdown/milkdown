/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, createTimer, MilkdownPlugin, Timer } from '@milkdown/ctx';
import type { Keymap, Plugin as ProsePlugin } from '@milkdown/prose';
import { keymap as proseKeymap } from '@milkdown/prose';

import { marksCtx, nodesCtx, schemaCtx, SchemaReady } from '../internal-plugin';
import { Atom, getAtom } from '../utility';
import { commandsCtx, CommandsReady } from './commands';

export const keymapCtx = createSlice<ProsePlugin[]>([], 'keymap');
export const keymapTimerCtx = createSlice<Timer[]>([], 'keymapTimer');

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
