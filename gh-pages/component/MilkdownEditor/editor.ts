/* Copyright 2021, Milkdown by Mirone. */
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { diagram } from '@milkdown/plugin-diagram';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { menu } from '@milkdown/plugin-menu';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { upload } from '@milkdown/plugin-upload';
import { gfm } from '@milkdown/preset-gfm';
import { nord } from '@milkdown/theme-nord';

import { codeSandBox } from './codeSandBox';

export const createEditor = (
    root: HTMLElement | null,
    defaultValue: string,
    readOnly: boolean | undefined,
    setEditorReady: (ready: boolean) => void,
    onChange?: (markdown: string) => void,
) => {
    const editor = Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, defaultValue);
            ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
            if (onChange) {
                ctx.get(listenerCtx)
                    .markdownUpdated((_, markdown) => {
                        onChange(markdown);
                    })
                    .mounted(() => {
                        setEditorReady(true);
                    });
            }
        })
        .use(nord)
        .use(gfm)
        .use(codeSandBox)
        .use(listener)
        .use(clipboard)
        .use(history)
        .use(cursor)
        .use(prism)
        .use(diagram)
        .use(tooltip)
        .use(math)
        .use(emoji)
        .use(indent)
        .use(upload)
        .use(slash);

    if (!readOnly) {
        editor.use(menu());
    }

    return editor;
};
