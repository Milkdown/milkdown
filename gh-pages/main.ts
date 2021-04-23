import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import { math } from '@milkdown/plugin-math';
import '@milkdown/plugin-math/lib/style.css';
import '@milkdown/theme-nord/lib/theme.css';
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

Math is also supported:

Now we have some inline math: $V \\times W \\stackrel{\\otimes}{\\rightarrow} V \\otimes W$. You can click to edit it.

Math block is also supported. 

$$
\\mathcal{L}(V \\otimes W, Z) \\cong \\big\\{ \\substack{\\text{bilinear maps}\\\\{V \\times W \\rightarrow Z}} \\big\\}
$$

You can also type \`$$\` and a \`space\` to create a math block.

---

Have fun!
`;

const root = document.getElementById('app');

if (!root) throw new Error();

const editor = new Editor({
    root,
    defaultValue: markdown,
    listener: {
        markdown: [(getValue) => console.log(getValue())],
    },
})
    .use(nodes)
    .use(marks)
    .use(prism)
    .use(math);

const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (!isMobile) {
    editor.use(tooltip);
}

editor.create();
