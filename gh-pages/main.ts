import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { math } from '@milkdown/plugin-math';
import { table } from '@milkdown/plugin-table';
import { slash } from '@milkdown/plugin-slash';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/plugin-math/lib/style.css';
import '@milkdown/plugin-table/lib/style.css';
import '@milkdown/plugin-tooltip/lib/style.css';
import '@milkdown/plugin-slash/lib/style.css';
import './style.css';

const markdown = `
# Milkdown

![logo](/milkdown/milkdown-mini.svg)

> Milkdown is a WYSIWYG markdown editor.
>
> Here is the [repo](https://github.com/Saul-Mirone/milkdown) (*right click to open link*).

You can check the output markdown text in **developer tool**.

---

You can add \`inline code\` and code block:

\`\`\`javascript
function main() {
    console.log('Hello milkdown!');
}
\`\`\`

---

You can type \`||\` and a \`space\` to create a table:

| First Header   | Second Header      |
| -------------- | :----------------: |
| Content Cell 1 | \`Content\` Cell 1 |
| Content Cell 2 | __Content__ Cell 2 |

---

Math is supported by [TeX expression](https://en.wikipedia.org/wiki/TeX).

Now we have some inline math: $V \\times W \\stackrel{\\otimes}{\\rightarrow} V \\otimes W$. You can click to edit it.

Math block is also supported. 

$$
\\mathcal{L}(V \\otimes W, Z) \\cong \\big\\{ \\substack{\\text{bilinear maps}\\\\{V \\times W \\rightarrow Z}} \\big\\}
$$

You can type \`$$\` and a \`space\` to create a math block.

---

Have fun!
`;

const root = document.getElementById('app');

if (!root) throw new Error();

new Editor({
    root,
    defaultValue: markdown,
    listener: {
        // markdown: [(getValue) => console.log(getValue())],
    },
})
    .use(nodes)
    .use(marks)
    .use(prism)
    .use(tooltip)
    .use(table)
    .use(math)
    .use(slash)
    .create();
