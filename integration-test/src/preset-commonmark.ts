/* Copyright 2021, Milkdown by Mirone. */
import { Editor, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';

export const setup = () => {
    return Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, document.getElementById('app'));
        })
        .use(nord)
        .use(commonmark)
        .create();
};
