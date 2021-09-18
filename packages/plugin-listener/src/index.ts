/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, MilkdownPlugin, prosePluginsCtx, serializerCtx, SerializerReady } from '@milkdown/core';
import { Node as ProseNode } from 'prosemirror-model';
import { Plugin as StatePlugin } from 'prosemirror-state';

export type DocListener = (doc: ProseNode) => void;
export type MarkdownListener = (getMarkdown: () => string) => void;
export type Listener = {
    doc?: DocListener[];
    markdown?: MarkdownListener[];
};
export const listenerCtx = createSlice<Listener>({});

export const listener: MilkdownPlugin = (pre) => {
    pre.inject(listenerCtx);

    return async (ctx) => {
        await ctx.wait(SerializerReady);
        const listener = ctx.get(listenerCtx);
        const serializer = ctx.get(serializerCtx);

        const plugin = new StatePlugin({
            state: {
                init: () => {
                    // do nothing
                },
                apply: (tr) => {
                    if (!tr.docChanged) return;

                    listener.markdown?.forEach((markdownListener) => {
                        markdownListener(() => serializer(tr.doc));
                    });
                    listener.doc?.forEach((docListener) => {
                        docListener(tr.doc);
                    });
                },
            },
        });
        ctx.update(prosePluginsCtx, (x) => x.concat(plugin));
    };
};
