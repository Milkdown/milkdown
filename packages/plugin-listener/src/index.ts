/* Copyright 2021, Milkdown by Mirone. */
import {
    createSlice,
    Ctx,
    EditorViewReady,
    InitReady,
    MilkdownPlugin,
    prosePluginsCtx,
    serializerCtx,
    SerializerReady,
} from '@milkdown/core';
import { Node as ProseNode, Plugin } from '@milkdown/prose';

class ListenerManager {
    private beforeMountedListeners: Array<(ctx: Ctx) => void> = [];
    private mountedListeners: Array<(ctx: Ctx) => void> = [];
    private updatedListeners: Array<(ctx: Ctx, doc: ProseNode, prevDoc: ProseNode | null) => void> = [];
    private markdownUpdatedListeners: Array<(ctx: Ctx, markdown: string, prevMarkdown: string | null) => void> = [];
    private blurListeners: Array<(ctx: Ctx) => void> = [];
    private focusListeners: Array<(ctx: Ctx) => void> = [];
    private destroyListeners: Array<(ctx: Ctx) => void> = [];

    get listeners() {
        return {
            beforeMounted: this.beforeMountedListeners,
            mounted: this.mountedListeners,
            updated: this.updatedListeners,
            markdownUpdated: this.markdownUpdatedListeners,
            blur: this.blurListeners,
            focus: this.focusListeners,
            destroy: this.destroyListeners,
        };
    }

    beforeMount = (fn: (ctx: Ctx) => void) => {
        this.beforeMountedListeners.push(fn);
        return this;
    };

    mounted = (fn: (ctx: Ctx) => void) => {
        this.mountedListeners.push(fn);
        return this;
    };

    updated = (fn: (ctx: Ctx, doc: ProseNode, prevDoc: ProseNode | null) => void) => {
        this.updatedListeners.push(fn);
        return this;
    };

    markdownUpdated(fn: (ctx: Ctx, markdown: string, prevMarkdown: string | null) => void) {
        this.markdownUpdatedListeners.push(fn);
        return this;
    }

    blur(fn: (ctx: Ctx) => void) {
        this.blurListeners.push(fn);
        return this;
    }

    focus(fn: (ctx: Ctx) => void) {
        this.focusListeners.push(fn);
        return this;
    }

    destroy(fn: (ctx: Ctx) => void) {
        this.destroyListeners.push(fn);
        return this;
    }
}

export const listenerCtx = createSlice<ListenerManager>(new ListenerManager(), 'listener');

export const listener: MilkdownPlugin = (pre) => {
    pre.inject(listenerCtx, new ListenerManager());

    return async (ctx) => {
        await ctx.wait(InitReady);
        const listener = ctx.get(listenerCtx);
        // @ts-expect-error deprecated old listener API
        if (listener.doc || listener.markdown) {
            throw new Error('listener.doc and listener.markdown are deprecated, use new listener manager API instead');
        }
        const { listeners } = listener;

        listeners.beforeMounted.forEach((fn) => fn(ctx));

        await ctx.wait(SerializerReady);
        const serializer = ctx.get(serializerCtx);

        let prevDoc: ProseNode | null = null;
        let prevMarkdown: string | null = null;

        const plugin = new Plugin({
            view: () => {
                return {
                    destroy: () => {
                        listeners.destroy.forEach((fn) => fn(ctx));
                    },
                };
            },
            props: {
                handleDOMEvents: {
                    focus: () => {
                        listeners.focus.forEach((fn) => fn(ctx));
                        return false;
                    },
                    blur: () => {
                        listeners.blur.forEach((fn) => fn(ctx));
                        return false;
                    },
                },
            },
            state: {
                init: () => {
                    // do nothing
                },
                apply: (tr) => {
                    if (!tr.docChanged) return;
                    const { doc } = tr;
                    if (listeners.updated.length > 0 && (prevDoc == null || prevDoc !== doc)) {
                        listeners.updated.forEach((fn) => {
                            fn(ctx, doc, prevDoc);
                        });
                    }
                    if (listeners.markdownUpdated.length > 0) {
                        const markdown = serializer(tr.doc);
                        if (prevMarkdown == null || prevMarkdown !== markdown) {
                            listeners.markdownUpdated.forEach((fn) => {
                                fn(ctx, markdown, prevMarkdown);
                            });
                            prevMarkdown = markdown;
                        }
                    }

                    prevDoc = doc;
                },
            },
        });
        ctx.update(prosePluginsCtx, (x) => x.concat(plugin));

        await ctx.wait(EditorViewReady);
        listeners.mounted.forEach((fn) => fn(ctx));
    };
};
