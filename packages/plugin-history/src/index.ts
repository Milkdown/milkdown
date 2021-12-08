/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { history as prosemirrorHistory, keymap as createKeymap, redo, undo } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const Undo = createCmdKey();
export const Redo = createCmdKey();

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
