/* Copyright 2021, Milkdown by Mirone. */
import { prosePluginFactory } from '@milkdown/core';
import { keymap as createKeymap } from '@milkdown/prose';
import { history as prosemirrorHistory, redo, undo } from 'prosemirror-history';

export const history = prosePluginFactory([
    prosemirrorHistory(),
    createKeymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Shift-Mod-z': redo,
    }),
]);
