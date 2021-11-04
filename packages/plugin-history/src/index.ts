/* Copyright 2021, Milkdown by Mirone. */
import { keymap as createKeymap } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';
import { history as prosemirrorHistory, redo, undo } from 'prosemirror-history';

export const history = createPlugin(() => ({
    prosePlugins: () => [
        prosemirrorHistory(),
        createKeymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Shift-Mod-z': redo,
        }),
    ],
}))();
