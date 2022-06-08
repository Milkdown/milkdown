/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor, editorViewCtx, rootCtx } from '@milkdown/core';
import { ViewFactory } from '@milkdown/prose';
import {
    ComponentInternalInstance,
    DefineComponent,
    defineComponent,
    getCurrentInstance,
    h,
    inject,
    InjectionKey,
    markRaw,
    onBeforeMount,
    onMounted,
    onUnmounted,
    provide,
    Ref,
    ref,
    shallowReactive,
} from 'vue';

import { AnyVueComponent } from './utils';
import { createVueView, RenderOptions } from './VueNodeView';

const rendererKey: InjectionKey<(component: DefineComponent, options?: RenderOptions) => (ctx: Ctx) => ViewFactory> =
    Symbol();

export type RenderVue = (Component: AnyVueComponent, options?: RenderOptions) => (ctx: Ctx) => ViewFactory;
export type GetEditor = (container: HTMLDivElement, renderVue: RenderVue) => Editor;

const useGetEditor = (getEditor: GetEditor) => {
    const divRef = ref<HTMLDivElement | null>(null);
    const renderVue = inject<(Component: DefineComponent, options?: RenderOptions) => (ctx: Ctx) => ViewFactory>(
        rendererKey,
        () => {
            throw new Error();
        },
    );
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

export const EditorComponent = defineComponent<{ editor: GetEditor; editorRef?: Ref<EditorRef> }>({
    name: 'milkdown-dom-root',
    setup: (props, { slots }) => {
        const refs = useGetEditor(props.editor);
        if (props.editorRef) {
            props.editorRef.value = {
                get: () => refs.editorRef.editor,
                dom: () => refs.divRef.value,
            };
        }

        return () => <div ref={refs.divRef}>{slots['default']?.()}</div>;
    },
});
EditorComponent['props'] = ['editor', 'editorRef'];

export type EditorRef = { get: () => Editor | undefined; dom: () => HTMLDivElement | null };

const rootInstance: {
    instance: null | ComponentInternalInstance;
} = {
    instance: null,
};
export const getRootInstance = () => {
    return rootInstance.instance;
};

type PortalPair = [key: string, component: DefineComponent];
export const VueEditor = defineComponent<{ editor: GetEditor; editorRef?: Ref<EditorRef> }>({
    name: 'milkdown-vue-root',
    setup: (props) => {
        const portals = shallowReactive<PortalPair[]>([]);

        const instance = getCurrentInstance();

        onBeforeMount(() => {
            rootInstance.instance = (instance as ComponentInternalInstance & { ctx: { _: ComponentInternalInstance } })
                .ctx._ as ComponentInternalInstance;
        });

        onUnmounted(() => {
            rootInstance.instance = null;
        });

        const addPortal = markRaw((component: DefineComponent, key: string) => {
            portals.push([key, component]);
        });
        const removePortalByKey = markRaw((key: string) => {
            const index = portals.findIndex((p) => p[0] === key);
            portals.splice(index, 1);
        });
        const renderVue = createVueView(addPortal, removePortalByKey);
        provide(rendererKey, renderVue);

        return () => {
            const portalElements = portals.map(([id, P]) => <P key={id} />);
            return (
                <EditorComponent editorRef={props.editorRef} editor={props.editor}>
                    {portalElements}
                </EditorComponent>
            );
        };
    },
});
VueEditor['props'] = ['editor', 'editorRef'];

export const useEditor = (getEditor: GetEditor) => {
    return (...args: Parameters<GetEditor>) => getEditor(...args);
};
