import { Editor, NodeViewFactory } from '@milkdown/core';

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
} from 'vue';
import { PortalPair, Portals } from './Portals';
import { createVueView } from './VueNodeView';

type GetEditor = (container: HTMLDivElement, renderVue: (Component: DefineComponent) => NodeViewFactory) => Editor;

export const useEditor = (getEditor: GetEditor) => {
    const divRef = ref<HTMLDivElement | null>(null);
    const renderVue = inject<(Component: DefineComponent) => NodeViewFactory>('renderVue', () => {
        throw new Error();
    });
    const editorRef = markRaw<{ editor?: Editor }>({});
    onMounted(() => {
        if (!divRef.value) return;

        const editor = getEditor(divRef.value, renderVue);

        editor.create();
        editorRef.editor = editor;
    });
    onUnmounted(() => {
        editorRef.editor?.view.destroy();
    });

    return divRef;
};

export const EditorComponent = defineComponent((props: { editor: GetEditor }) => {
    const ref = useEditor(props.editor);

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

export const useGetEditor = (getEditor: GetEditor) => {
    return (...args: Parameters<GetEditor>) => getEditor(...args);
};
