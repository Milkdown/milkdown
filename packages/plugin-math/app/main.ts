/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { defaultValueCtx, Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

import { math } from '../src';

const markdown = `
# Milkdown Test

$V \\times W \\stackrel{\\otimes}{\\rightarrow} V \\otimes W$

$$
\\mathcal{L}(V \\otimes W, Z) \\cong \\big\\{ \\substack{\\text{bilinear maps}\\\\{V \\times W \\rightarrow Z}} \\big\\}
$$

math
`;

Editor.make()
    .config((ctx) => {
        ctx.set(defaultValueCtx, markdown);
    })
    .use(nord)
    .use(nodes)
    .use(marks)
    .use(math)
    .create();
