/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createProsePlugin } from '@milkdown/utils';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import type { Awareness } from 'y-protocols/awareness';
import { Doc, XmlFragment } from 'yjs';

import { injectStyle } from './injectStyle';

type Options = {
    doc: Doc;
    awareness: Awareness;
};

export const y = createProsePlugin<Options>(({ doc, awareness } = {}, utils) => {
    if (!doc || !awareness) {
        throw new Error('Must provide doc and awareness for collaborative plugin');
    }
    const type = doc.get('prosemirror', XmlFragment);
    utils.getStyle(injectStyle);

    return [
        ySyncPlugin(type),
        yCursorPlugin(awareness),
        yUndoPlugin(),
        keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
        }),
    ];
});

export const collaborative = AtomList.create([y()]);
