import { createProsemirrorPlugin } from '@milkdown/core';
import { columnResizing, tableEditing } from 'prosemirror-tables';
import { nodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';

const plugin = createProsemirrorPlugin('milkdown-table', () => [
    columnResizing({}),
    tableEditing(),
    tableOperatorPlugin(),
]);

export const table = [...nodes, plugin];
