import { Editor } from '@milkdown/core';
import { gfm } from '../src';
import './style.css';

const markdown = `
# Milkdown Test

Here is ~~one strike~~, and here is ~another~.
`;

const app = document.getElementById('app');

new Editor({
    root: app,
    defaultValue: markdown,
    listener: {
        markdown: [(x) => console.log(x())],
    },
})
    .use(gfm)
    .create();
