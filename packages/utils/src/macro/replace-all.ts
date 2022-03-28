/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose';

export const replaceAll = (markdown: string) => (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const parser = ctx.get(parserCtx);
    const doc = parser(markdown);
    if (!doc) return;
    const { state } = view;
    return view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
};
