import { Editor, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';

import '@milkdown/theme-nord/lib/theme.css';
import '@milkdown/preset-commonmark/lib/style.css';

export const setup = () => {
    return new Editor()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
        })
        .use(commonmark)
        .create();
};
