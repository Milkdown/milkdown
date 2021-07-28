import { Doc, XmlFragment } from 'yjs';
import { MilkdownPlugin, prosePluginFactory } from '@milkdown/core';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';

type Collaborative = {
    (provider: unknown): MilkdownPlugin;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yDoc: any;
};

const yDoc = new Doc();
const collaborative: Collaborative = (awareness: unknown) => {
    const type = yDoc.get('prosemirror', XmlFragment);

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
collaborative.yDoc = yDoc;

export { collaborative };
