/* Copyright 2021, Milkdown by Mirone. */
import { defaultValueCtx, Editor, editorViewCtx, rootCtx, serializerCtx } from '@milkdown/core';
import { nord } from '@milkdown/theme-nord';

import { gfm } from '../src';

const markdown = `
# Milkdown Test <span style="background: yellow">QAQ</span>

Here is ~~one strike~~, and here is ~another~.

Auto link: www.github.com is a link.

* [ ] task 1
* [x] task 2

<div style="background: red">alert(1)</div>
`;

const app = document.getElementById('app');

Editor.make()
    .config((ctx) => {
        ctx.set(rootCtx, app);
        ctx.set(defaultValueCtx, markdown);
    })
    .use(nord)
    .use(gfm)
    .create();
