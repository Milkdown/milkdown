import { createProsemirrorPlugin, createMarkdownItPlugin, createMarkdownItRule } from '@milkdown/core';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
import { keymap } from 'prosemirror-keymap';
import { nodes } from './nodes';
import { tableOperatorPlugin } from './table-operator-plugin';
import { markdownItTablePlugin } from './markdown-it-table-plugin';
import { exitTable } from './command';

const plugin = createProsemirrorPlugin('milkdown-table', (ctx) => [
    columnResizing({}),
    tableEditing(),
    tableOperatorPlugin(),
    keymap({
        'Mod-]': goToNextCell(1),
        'Mod-[': goToNextCell(-1),
        'Mod-Enter': exitTable(ctx.schema.nodes.paragraph),
    }),
]);

const rule = createMarkdownItRule('milkdown-table-rule', () => ['table']);
const markdownItPlugin = createMarkdownItPlugin('milkdown-table-markdown', () => [markdownItTablePlugin]);

export const table = [...nodes, rule, markdownItPlugin, plugin];
