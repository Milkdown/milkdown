import { Editor, editorOptionsCtx } from '@milkdown/core';
import { prism } from '@milkdown/plugin-prism';
import { table } from '@milkdown/plugin-table';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { slash } from '../src';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/plugin-table/lib/style.css';
import '../style/style.css';
import './style.css';

const markdown = `
# Milkdown Test

`;

const root = document.getElementById('app');

if (!root) throw new Error();

new Editor()
    .config((ctx) => {
        ctx.update(editorOptionsCtx, (prev) => ({
            ...prev,
            root,
            defaultValue: markdown,
            listener: {
                markdown: [(x) => console.log(x())],
            },
        }));
    })
    .use(nodes)
    .use(marks)
    .use(prism)
    .use(table)
    .use(slash)
    .create();
