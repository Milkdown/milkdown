/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { defaultValueCtx, Editor, themeManagerCtx } from '@milkdown/core';
import { math } from '@milkdown/plugin-math';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { tokyo } from '@milkdown/theme-tokyo';

const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

async function main() {
    const editor = await Editor.make()
        .config((ctx) => {
            ctx.set(defaultValueCtx, '# Here is [mylink](https://milkdown.dev)');
        })
        .use(tokyo)
        .use(commonmark)
        .use(math)
        .create();

    await sleep(2000);

    editor.action(async (ctx) => {
        const themeManager = ctx.get(themeManagerCtx);
        themeManager.switch(ctx, nord);
    });
}

main();
