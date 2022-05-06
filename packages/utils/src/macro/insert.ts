/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose/model';

export const insert = (markdown: string) => (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const parser = ctx.get(parserCtx);
    const doc = parser(markdown);
    if (!doc) return;

    const contentSlice = view.state.selection.content();
    return view.dispatch(
        view.state.tr
            .replaceSelection(new Slice(doc.content, contentSlice.openStart, contentSlice.openEnd))
            .scrollIntoView(),
    );
};
