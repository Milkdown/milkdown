/* Copyright 2021, Milkdown by Mirone. */

import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prismPlugin } from '@milkdown/plugin-prism';
import { gfm } from '@milkdown/preset-gfm';
import { nord } from '@milkdown/theme-nord';
import { outline } from '@milkdown/utils';
import { refractor } from 'refractor/lib/common';

import { iframe } from './iframe';
import { Outline } from './Outline';

export const docRendererFactory = (
    root: HTMLElement,
    markdown: string,
    setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>,
) => {
    const editor = Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, markdown);
            ctx.update(editorViewOptionsCtx, (prev) => ({ ...prev, editable: () => false }));
            ctx.get(listenerCtx).mounted((ctx) => {
                setOutlines(outline()(ctx));
            });
        })
        .use(gfm)
        .use(listener)
        .use(iframe)
        .use(
            prismPlugin({
                configureRefractor: () => refractor,
            }),
        )
        .use(nord);

    return editor;
};
