import { Editor, editorViewOptionsCtx } from '@milkdown/core';
import { gfm } from '../src';

const markdown = `
# Milkdown Test

Here is ~~one strike~~, and here is ~another~.

Auto link: www.github.com is a link.

* [ ] task 1
* [x] task 2
`;

const app = document.getElementById('app');

new Editor()
    .config((ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            root: app,
            defaultValue: markdown,
        }));
    })
    .use(gfm)
    .create();
