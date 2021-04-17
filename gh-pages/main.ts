import { Editor, marks, nodes, ProsemirrorPluginLoader } from '@milkdown/core';
import { Prism } from '@milkdown/plugin-prism';
import '@milkdown/theme-nord/lib/theme.css';
import './style.css';

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

new Editor({
    root,
    defaultValue: markdown,
    listener: {
        markdown: [(getValue) => console.log(getValue())],
    },
})
    .use(nodes)
    .use(marks)
    .use(new ProsemirrorPluginLoader({ plugins: [Prism('fence')] }))
    .create();
