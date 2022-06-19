/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, serializerCtx } from '@milkdown/core';

export const getMarkdown =
    () =>
    (ctx: Ctx): string => {
        const view = ctx.get(editorViewCtx);
        const serializer = ctx.get(serializerCtx);

        return serializer(view.state.doc);
    };
