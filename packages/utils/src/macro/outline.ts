/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx } from '@milkdown/core';

export const outline = () => (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const data: { text: string; level: number }[] = [];
    const doc = view.state.doc;
    doc.descendants((node) => {
        if (node.type.name === 'heading' && node.attrs['level']) {
            data.push({ text: node.textContent, level: node.attrs['level'] });
        }
    });
    return data;
};
