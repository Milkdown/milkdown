import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';

import { math } from '../src';
import '../style/style.css';
import '@milkdown/theme-nord/lib/theme.css';

import './style.css';

const markdown = `
# Milkdown Test

$V \\times W \\stackrel{\\otimes}{\\rightarrow} V \\otimes W$

$$
\\mathcal{L}(V \\otimes W, Z) \\cong \\big\\{ \\substack{\\text{bilinear maps}\\\\{V \\times W \\rightarrow Z}} \\big\\}
$$

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
    .use(math)
    .create();
