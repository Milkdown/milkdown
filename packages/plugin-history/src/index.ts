import { createProsemirrorPlugin } from '@milkdown/core';
import { history as prosemirrorHistory, redo, undo } from 'prosemirror-history';
import { keymap as createKeymap } from 'prosemirror-keymap';

export const history = createProsemirrorPlugin('milkdown-plugin-history', () => [
    prosemirrorHistory(),
    createKeymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Shift-Mod-z': redo,
    }),
]);
