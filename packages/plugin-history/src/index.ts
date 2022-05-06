/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { history as prosemirrorHistory, redo, undo } from '@milkdown/prose/history';
import { keymap as createKeymap } from '@milkdown/prose/keymap';
import { createPlugin } from '@milkdown/utils';

export const Undo = createCmdKey('Undo');
export const Redo = createCmdKey('Redo');

export const history = createPlugin(() => ({
    commands: () => [createCmd(Undo, () => undo), createCmd(Redo, () => redo)],
    prosePlugins: () => [
        prosemirrorHistory(),
        createKeymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Shift-Mod-z': redo,
        }),
    ],
}))();
