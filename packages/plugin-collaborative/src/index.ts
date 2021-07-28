import type { Awareness } from 'y-protocols/awareness';
import { Doc, XmlFragment } from 'yjs';
import { prosePluginFactory } from '@milkdown/core';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';

const collaborative = (doc: Doc, awareness: Awareness) => {
    const type = doc.get('prosemirror', XmlFragment);
    return prosePluginFactory([
        ySyncPlugin(type),
        yCursorPlugin(awareness),
        yUndoPlugin(),
        keymap({
            'Mod-z': undo,
            'Mod-y': redo,
            'Mod-Shift-z': redo,
        }),
    ]);
};

export { collaborative };
