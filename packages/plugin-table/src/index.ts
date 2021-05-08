import { createProsemirrorPlugin, createMarkdownItPlugin, createMarkdownItRule } from '@milkdown/core';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { keymap } from 'prosemirror-keymap';
import { nodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';
import { markdownItTablePlugin } from './markdown-it-table-plugin';

const plugin = createProsemirrorPlugin('milkdown-table', () => [
    columnResizing({}),
    tableEditing(),
    tableOperatorPlugin(),
    keymap({
        'Mod-]': goToNextCell(1),
        'Mod-[': goToNextCell(-1),
    }),
]);

const rule = createMarkdownItRule('milkdown-table-rule', () => ['table']);
const markdownItPlugin = createMarkdownItPlugin('milkdown-table-markdown', () => [markdownItTablePlugin]);

export const table = [...nodes, rule, markdownItPlugin, plugin];
