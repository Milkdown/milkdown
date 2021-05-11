import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { slash } from '../src';

import '@milkdown/theme-nord/lib/theme.css';
import '../style/style.css';
import './style.css';

const markdown = `
# Milkdown Test

`;

const root = document.getElementById('app');

if (!root) throw new Error();

new Editor({
    root,
    defaultValue: markdown,
    listener: {
        markdown: [(x) => console.log(x())],
    },
})
    .use(nodes)
    .use(marks)
    .use(slash)
    .create();
