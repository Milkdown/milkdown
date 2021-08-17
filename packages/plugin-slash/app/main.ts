import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { prism } from '@milkdown/plugin-prism';
import { table } from '@milkdown/plugin-table';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { slash } from '../src';

import './style.css';

const markdown = `
# Milkdown Test

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
    .use(prism)
    .use(table)
    .use(slash)
    .create();
