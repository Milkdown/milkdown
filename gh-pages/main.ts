import { Editor } from '@milkdown/core';
import { Prism } from '@milkdown/plugin-prism';
import '@milkdown/theme-nord/lib/theme.css';
import './style.css';

const markdown = `
# Milkdown

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
    onChange: (getValue) => console.log(getValue()),
    plugins: [Prism('fence')],
});
