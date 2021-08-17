import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { table } from '../src';

import './style.css';

const markdown = `
# Milkdown Test

| First Header  | Second Header     |
| ------------- | :---------------: |
| Content Cell  | \`Content\` Cell  |
|               | __Content__ Cell  |
`;

const root = document.getElementById('app');

if (!root) throw new Error();

new Editor()
    .config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            root,
            defaultValue: markdown,
        }));
    })
    .use(nodes)
    .use(marks)
    .use(table)
    .create();
