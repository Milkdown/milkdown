/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { history as prosemirrorHistory, redo, undo } from '@milkdown/prose/history';
import { keymap as createKeymap } from '@milkdown/prose/keymap';
import { AtomList, createPlugin } from '@milkdown/utils';

export const Undo = createCmdKey('Undo');
export const Redo = createCmdKey('Redo');

export const historyPlugin = createPlugin(() => ({
    commands: () => [createCmd(Undo, () => undo), createCmd(Redo, () => redo)],
    prosePlugins: () => [
        prosemirrorHistory(),
        createKeymap({
            'Mod-z': undo,
            'Mod-Z': undo,
            'Mod-y': redo,
            'Mod-Y': redo,
            'Shift-Mod-z': redo,
        }),
    ],
}));

export const history = AtomList.create([historyPlugin()]);
