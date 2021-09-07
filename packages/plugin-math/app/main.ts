/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { math } from '../src';

const markdown = `
# Milkdown Test

$V \\times W \\stackrel{\\otimes}{\\rightarrow} V \\otimes W$

$$
\\mathcal{L}(V \\otimes W, Z) \\cong \\big\\{ \\substack{\\text{bilinear maps}\\\\{V \\times W \\rightarrow Z}} \\big\\}
$$

math
`;

const root = document.getElementById('app');

if (!root) throw new Error();

Editor.make()
    .config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            root,
            defaultValue: markdown,
        }));
    })
    .use(nodes)
    .use(marks)
    .use(math)
    .create();
