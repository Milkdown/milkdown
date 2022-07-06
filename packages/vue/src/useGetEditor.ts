/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, rootCtx } from '@milkdown/core';
import { vueRendererCallOutOfScope } from '@milkdown/exception';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import { DefineComponent, inject, InjectionKey, onMounted, onUnmounted, ref } from 'vue';

import { editorInfoCtxKey } from '.';
import { EditorInfoCtx, GetEditor, RenderOptions, RenderVue } from './types';

export const rendererKey: InjectionKey<
    (component: DefineComponent, options?: RenderOptions) => (ctx: Ctx) => NodeViewConstructor | MarkViewConstructor
> = Symbol();

export const useGetEditor = (getEditor: GetEditor) => {
    const renderVue = inject<RenderVue>(rendererKey, () => {
        throw vueRendererCallOutOfScope();
    });
    const { dom, loading, editor: editorRef } = inject(editorInfoCtxKey, {} as EditorInfoCtx);
    const lock = ref(false);

    onMounted(() => {
        if (!dom.value) return;

        const editor = getEditor(dom.value, renderVue);
        if (!editor) return;

        if (lock.value) return;

        loading.value = true;
        lock.value = true;

        editor
            .create()
            .then((editor) => {
                editorRef.value = editor;
                return;
            })
            .finally(() => {
                loading.value = false;
                lock.value = false;
            })
            .catch((e) => console.error(e));
    });
    onUnmounted(() => {
        const view = editorRef.value?.action((ctx) => ctx.get(editorViewCtx));
        const root = editorRef.value?.action((ctx) => ctx.get(rootCtx)) as HTMLElement;

        root?.firstChild?.remove();
        view?.destroy();
    });
};
