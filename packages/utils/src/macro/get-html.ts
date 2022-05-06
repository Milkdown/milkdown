/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, schemaCtx } from '@milkdown/core';
import { DOMSerializer } from '@milkdown/prose/model';

export const getHTML =
    () =>
    (ctx: Ctx): string => {
        const div = document.createElement('div');
        const schema = ctx.get(schemaCtx);
        const view = ctx.get(editorViewCtx);
        const fragment = DOMSerializer.fromSchema(schema).serializeFragment(view.state.doc.content);

        div.appendChild(fragment);

        return div.innerHTML;
    };
