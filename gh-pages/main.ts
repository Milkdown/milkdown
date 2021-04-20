import { Editor } from '@milkdown/core';
import { marks, nodes } from '@milkdown/preset-commonmark';
import { prism } from '@milkdown/plugin-prism';
import { tooltip } from '@milkdown/plugin-tooltip';
import '@milkdown/theme-nord/lib/theme.css';
import './style.css';

document.body.requestFullscreen().catch((e) => {
    console.error('Error attempting to enable full-screen');
    console.error(e.toString());
});

const markdown = `
# Milkdown

![logo](/milkdown/milkdown-mini.svg)

> Milkdown is a WYSIWYG markdown editor.
>
> Here is the [repo](https://github.com/Saul-Mirone/milkdown) (*right click to open link*).

You can check the output markdown text in **developer tool**.
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
    .use(prism);

const isMobile = /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
);
if (!isMobile) {
    editor.use(tooltip);
}

editor.create();
