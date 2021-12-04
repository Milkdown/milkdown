/* Copyright 2021, Milkdown by Mirone. */
import { Editor, editorViewCtx, rootCtx } from '@milkdown/core';
import { ViewFactory } from '@milkdown/prose';
import {
    DefineComponent,
    defineComponent,
    Fragment,
    h,
    inject,
    InjectionKey,
    markRaw,
    onMounted,
    onUnmounted,
    provide,
    Ref,
    ref,
    shallowReactive,
} from 'vue';

import { PortalPair, Portals } from './Portals';
import { createVueView } from './VueNodeView';

const rendererKey: InjectionKey<(component: DefineComponent) => ViewFactory> = Symbol();

type GetEditor = (container: HTMLDivElement, renderVue: (Component: DefineComponent) => ViewFactory) => Editor;

const useGetEditor = (getEditor: GetEditor) => {
    const divRef = ref<HTMLDivElement | null>(null);
    const renderVue = inject<(Component: DefineComponent) => ViewFactory>(rendererKey, () => {
        throw new Error();
    });
    const editorRef = markRaw<{ editor?: Editor }>({});
    onMounted(() => {
        if (!divRef.value) return;

        getEditor(divRef.value, renderVue)
            .create()
            .then((editor) => {
                editorRef.editor = editor;
                return;
            })
            .catch((e) => console.error(e));
    });
    onUnmounted(() => {
        const view = editorRef.editor?.action((ctx) => ctx.get(editorViewCtx));
        const root = editorRef.editor?.action((ctx) => ctx.get(rootCtx)) as HTMLElement;

        root?.firstChild?.remove();
        view?.destroy();
    });

    return { divRef, editorRef };
};

export const EditorComponent = defineComponent((props: { editor: GetEditor; editorRef?: Ref<EditorRef> }) => {
    const refs = useGetEditor(props.editor);
    if (props.editorRef) {
        props.editorRef.value = {
            get: () => refs.editorRef.editor,
            dom: () => refs.divRef.value,
        };
    }

    return () => <div ref={refs.divRef} />;
});
EditorComponent.props = ['editor', 'editorRef'];

export type EditorRef = { get: () => Editor | undefined; dom: () => HTMLDivElement | null };

export const VueEditor = defineComponent((props: { editor: GetEditor; editorRef?: Ref<EditorRef> }) => {
    const portals = shallowReactive<PortalPair[]>([]);
    const addPortal = markRaw((component: DefineComponent, key: string) => {
        portals.push([key, component]);
    });
    const removePortalByKey = markRaw((key: string) => {
        const index = portals.findIndex((p) => p[0] === key);
        portals.splice(index, 1);
    });
    const renderVue = createVueView(addPortal, removePortalByKey);
    provide(rendererKey, renderVue);

    return () => (
        <>
            <Portals portals={portals} />
            <EditorComponent editorRef={props.editorRef} editor={props.editor} />
        </>
    );
});
VueEditor.props = ['editor', 'editorRef'];

export const useEditor = (getEditor: GetEditor) => {
    return (...args: Parameters<GetEditor>) => getEditor(...args);
};
