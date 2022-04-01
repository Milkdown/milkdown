/* Copyright 2021, Milkdown by Mirone. */

import { Attrs, Ctx, editorViewCtx } from '@milkdown/core';

export const setAttr = (pos: number, update: (prevAttrs: Attrs) => Attrs) => (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx);
    const { tr } = view.state;
    const node = tr.doc.nodeAt(pos);
    if (!node) return;
    const nextAttr = update(node.attrs);
    return view.dispatch(tr.setNodeMarkup(pos, undefined, nextAttr));
};
