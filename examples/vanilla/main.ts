/* Copyright 2021, Milkdown by Mirone. */
import './style.css';

import { Ctx, defaultValueCtx, Editor, editorViewCtx, editorViewOptionsCtx, themeManagerCtx } from '@milkdown/core';
import { math } from '@milkdown/plugin-math';
import { menu } from '@milkdown/plugin-menu';
import { slash } from '@milkdown/plugin-slash';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { tokyo } from '@milkdown/theme-tokyo';

const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

let editable = true;

async function main() {
    const editor = await Editor.make()
        .config((ctx) => {
            ctx.set(defaultValueCtx, '# Here is [mylink](https://milkdown.dev)');
            ctx.update(editorViewOptionsCtx, (x) => ({
                ...x,
                editable: () => editable,
            }));
        })
        .use(tokyo)
        .use(commonmark)
        .use(math)
        .use(menu)
        .use(slash)
        .create();

    await sleep(2000);

    const toggleEditable = (ctx: Ctx) => {
        editable = !editable;
        const view = ctx.get(editorViewCtx);
        const { tr } = view.state;

        const nextTr = Object.assign(Object.create(tr), tr).setTime(Date.now());
        view.dispatch(nextTr);
    };

    editor.action(toggleEditable);

    editor.action(async (ctx) => {
        const themeManager = ctx.get(themeManagerCtx);
        themeManager.switch(ctx, nord);
    });

    await sleep(2000);
    editor.action(toggleEditable);
}

main();
