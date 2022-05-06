/* Copyright 2021, Milkdown by Mirone. */
import {
    Ctx,
    editorStateOptionsCtx,
    editorViewCtx,
    parserCtx,
    prosePluginsCtx,
    schemaCtx,
    themeManagerCtx,
} from '@milkdown/core';
import { Slice } from '@milkdown/prose/model';
import { EditorState } from '@milkdown/prose/state';

export const replaceAll =
    (markdown: string, flush = false) =>
    (ctx: Ctx): void => {
        const view = ctx.get(editorViewCtx);
        const parser = ctx.get(parserCtx);
        const doc = parser(markdown);
        if (!doc) return;

        if (!flush) {
            const { state } = view;
            return view.dispatch(state.tr.replace(0, state.doc.content.size, new Slice(doc.content, 0, 0)));
        }

        const schema = ctx.get(schemaCtx);
        const options = ctx.get(editorStateOptionsCtx);
        const plugins = ctx.get(prosePluginsCtx);
        const themeManager = ctx.get(themeManagerCtx);

        const state = EditorState.create({
            schema,
            doc,
            plugins,
            ...options,
        });

        view.updateState(state);
        themeManager.flush(ctx);
    };
