import { Editor, editorViewCtx, serializerCtx, defaultValueCtx, rootCtx } from '@milkdown/core';
import { gfm } from '../src';
import { nord } from '@milkdown/theme-nord';

const markdown = `
# Milkdown Test <span style="background: yellow">QAQ</span>

Here is ~~one strike~~, and here is ~another~.

Auto link: www.github.com is a link.

* [ ] task 1
* [x] task 2

<div style="background: red">alert(1)</div>
`;

const app = document.getElementById('app');

new Editor()
    .config((ctx) => {
        ctx.set(rootCtx, app);
        ctx.set(defaultValueCtx, markdown);
    })
    .use(nord)
    .use(gfm)
    .create();
