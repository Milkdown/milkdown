/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx } from '@milkdown/core';
import { Slice } from '@milkdown/prose';

export const insert = (markdown: string) => (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const parser = ctx.get(parserCtx);
    const doc = parser(markdown);
    if (!doc) return;
    const { state } = view;
    const { selection } = state;
    return view.dispatch(state.tr.replace(selection.from, selection.to, new Slice(doc.content, 0, 0)));
};
