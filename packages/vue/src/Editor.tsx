import { Editor, editorViewCtx, NodeViewFactory } from '@milkdown/core';

import {
    defineComponent,
    provide,
    DefineComponent,
    onMounted,
    onUnmounted,
    ref,
    inject,
    shallowReactive,
    markRaw,
    h,
    Fragment,
} from 'vue';
import { PortalPair, Portals } from './Portals';
import { createVueView } from './VueNodeView';

type GetEditor = (container: HTMLDivElement, renderVue: (Component: DefineComponent) => NodeViewFactory) => Editor;

const useGetEditor = (getEditor: GetEditor) => {
    const divRef = ref<HTMLDivElement | null>(null);
    const renderVue = inject<(Component: DefineComponent) => NodeViewFactory>('renderVue', () => {
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
        editorRef.editor?.action((ctx) => ctx.get(editorViewCtx)).destroy();
    });

    return divRef;
};

export const EditorComponent = defineComponent((props: { editor: GetEditor }) => {
    const ref = useGetEditor(props.editor);

    return () => <div ref={ref} />;
});
EditorComponent.props = ['editor'];

export const VueEditor = defineComponent((props: { editor: GetEditor }) => {
    const portals = shallowReactive<PortalPair[]>([]);
    const addPortal = markRaw((component: DefineComponent, key: string) => {
        portals.push([key, component]);
    });
    const removePortalByKey = markRaw((key: string) => {
        const index = portals.findIndex((p) => p[0] === key);
        portals.splice(index, 1);
    });
    const renderVue = createVueView(addPortal, removePortalByKey);
    provide('renderVue', renderVue);

    return () => (
        <>
            <Portals portals={portals} />
            <EditorComponent editor={props.editor} />
        </>
    );
});
VueEditor.props = ['editor'];

export const useEditor = (getEditor: GetEditor) => {
    return (...args: Parameters<GetEditor>) => getEditor(...args);
};
