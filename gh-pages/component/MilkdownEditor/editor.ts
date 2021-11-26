/* Copyright 2021, Milkdown by Mirone. */
import {
    defaultValueCtx,
    Editor,
    editorViewOptionsCtx,
    EditorViewReady,
    MilkdownPlugin,
    rootCtx,
} from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { diagram } from '@milkdown/plugin-diagram';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { upload } from '@milkdown/plugin-upload';
import { gfm } from '@milkdown/preset-gfm';
import { nordDark, nordLight } from '@milkdown/theme-nord';

import { codeSandBox } from './codeSandBox';

const complete =
    (callback: () => void): MilkdownPlugin =>
    () =>
    async (ctx) => {
        await ctx.wait(EditorViewReady);

        callback();
    };

export const createEditor = (
    root: HTMLElement | null,
    defaultValue: string,
    readOnly: boolean | undefined,
    setEditorReady: (ready: boolean) => void,
    isDarkMode: boolean,
    onChange?: (getMarkdown: () => string) => void,
) =>
    Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, defaultValue);
            ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
            ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
        })
        .use(isDarkMode ? nordDark : nordLight)
        .use(gfm)
        .use(codeSandBox)
        .use(complete(() => setEditorReady(true)))
        .use(clipboard)
        .use(listener)
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
