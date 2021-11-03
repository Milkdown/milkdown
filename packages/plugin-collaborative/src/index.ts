/* Copyright 2021, Milkdown by Mirone. */
import { keymap } from '@milkdown/prose';
import { AtomList, createPlugin } from '@milkdown/utils';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import type { Awareness } from 'y-protocols/awareness';
import { Doc, XmlFragment } from 'yjs';

import { injectStyle } from './injectStyle';

type Options = {
    doc: Doc;
    awareness: Awareness;
};

export const y = createPlugin<string, Options>((utils, { doc, awareness } = {}) => {
    if (!doc || !awareness) {
        throw new Error('Must provide doc and awareness for collaborative plugin');
    }
    const type = doc.get('prosemirror', XmlFragment);
    utils.getStyle(injectStyle);

    const plugin = [
        ySyncPlugin(type),
        yCursorPlugin(awareness),
        yUndoPlugin(),
        keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
        }),
    ];

    return {
        prosePlugins: () => plugin,
    };
});

export const collaborative = AtomList.create([y()]);
