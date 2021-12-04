/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { keymap as createKeymap } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';
import { history as prosemirrorHistory, redo, undo } from 'prosemirror-history';

export const Undo = createCmdKey();
export const Redo = createCmdKey();

export * as prosemirrorHistory from 'prosemirror-history';

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
