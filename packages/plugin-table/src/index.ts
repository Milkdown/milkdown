import { createProsemirrorPlugin, createRemarkPlugin } from '@milkdown/core';
import { columnResizing, tableEditing } from 'prosemirror-tables';
import gfm from 'remark-gfm';
import { tableNodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';

export const remarkGFMPlugin = createRemarkPlugin('remark-table-markdown', () => [gfm]);
export const tableEditPlugin = createProsemirrorPlugin('prosemirror-table-edit', () => [
    columnResizing({}),
    tableOperatorPlugin(),
    tableEditing(),
]);

export const tablePlugin = [remarkGFMPlugin, tableEditPlugin];
export const table = [...tablePlugin, ...tableNodes];

export * from './nodes';
export * from './utils';
