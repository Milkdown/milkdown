import { createProsemirrorPlugin } from '@milkdown/core';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { keymap } from 'prosemirror-keymap';
import { nodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';

const plugin = createProsemirrorPlugin('milkdown-table', () => [
    columnResizing({}),
    tableEditing(),
    tableOperatorPlugin(),
    keymap({
        'Mod-]': goToNextCell(1),
        'Mod-[': goToNextCell(-1),
    }),
]);

export const table = [...nodes, plugin];
