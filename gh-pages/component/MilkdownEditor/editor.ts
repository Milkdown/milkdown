import { Complete, defaultValueCtx, Editor, editorViewOptionsCtx, MilkdownPlugin, rootCtx } from '@milkdown/core';

import { clipboard } from '@milkdown/plugin-clipboard';
import { history } from '@milkdown/plugin-history';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { prism } from '@milkdown/plugin-prism';

import { emoji } from '@milkdown/plugin-emoji';
import '@milkdown/plugin-emoji/lib/style.css';

import { cursor } from '@milkdown/plugin-cursor';
import '@milkdown/plugin-cursor/lib/style.css';

import { math } from '@milkdown/plugin-math';
import '@milkdown/plugin-math/lib/style.css';

import { slash } from '@milkdown/plugin-slash';
import '@milkdown/plugin-slash/lib/style.css';

import { tooltip } from '@milkdown/plugin-tooltip';
import '@milkdown/plugin-tooltip/lib/style.css';

import { gfm } from '@milkdown/preset-gfm';
import '@milkdown/preset-gfm/lib/style.css';

import { codeSandBox } from './codeSandBox';

const complete =
    (callback: () => void): MilkdownPlugin =>
    () =>
    async (ctx) => {
        await ctx.wait(Complete);

        callback();
    };

export const createEditor = (
    root: HTMLElement | null,
    defaultValue: string,
    readOnly: boolean | undefined,
    setEditorReady: (ready: boolean) => void,
    onChange?: (getMarkdown: () => string) => void,
) => {
    const editor = Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, defaultValue);
            ctx.set(editorViewOptionsCtx, { editable: () => !readOnly });
            ctx.set(listenerCtx, { markdown: onChange ? [onChange] : [] });
        })
        .use(gfm)
        .use(codeSandBox)
        .use(complete(() => setEditorReady(true)))
        .use(clipboard)
        .use(listener)
        .use(history)
        .use(cursor())
        .use(prism)
        .use(emoji)
        .use(tooltip)
        .use(math)
        .use(slash);

    return editor;
};
