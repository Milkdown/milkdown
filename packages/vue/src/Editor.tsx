/* Copyright 2021, Milkdown by Mirone. */
import {
    ComponentInternalInstance,
    DefineComponent,
    defineComponent,
    effect,
    getCurrentInstance,
    h,
    InjectionKey,
    markRaw,
    onBeforeMount,
    onUnmounted,
    provide,
    shallowReactive,
} from 'vue';

import { EditorComponent, EditorRef } from './EditorComponent';
import { EditorInfo, EditorInfoCtx } from './types';
import { rendererKey } from './useGetEditor';
import { createVueView } from './VueNodeView';

const rootInstance: {
    instance: null | ComponentInternalInstance;
} = {
    instance: null,
};
export const getRootInstance = () => {
    return rootInstance.instance;
};

export const editorInfoCtxKey: InjectionKey<EditorInfoCtx> = Symbol();

const refDeprecatedInfo = `
@milkdown/vue:
Passing ref to VueEditor will soon be deprecated, please use:

const { editor, getInstance, getDom, loading } = useEditor(/* creator */);

effect(() => {
    if (!loading) {
        const editor = getInstance();
        const rootDOM = getDom();
    }
})

<VueEditor editor={editor} />
`;

const compositionDeprecatedInfo = `
@milkdown/vue:
Passing editor directly to VueEditor will soon be deprecated, please use:

const { editor } = useEditor(/* creator */);

<VueEditor editor={editor} />
`;

type PortalPair = [key: string, component: DefineComponent];
export const VueEditor = defineComponent<{ editor: EditorInfo; editorRef?: EditorRef }>({
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

        const usingDeprecatedCompositionAPI = Object.hasOwnProperty.call(props.editor, 'getInstance');

        const { getEditorCallback, dom, editor, loading } = usingDeprecatedCompositionAPI
            ? // @ts-expect-error deprecated old composition API
              (props.editor.editor as EditorInfo)
            : props.editor;

        effect(() => {
            if (usingDeprecatedCompositionAPI) {
                console.warn(compositionDeprecatedInfo);
            }
            if (props.editorRef) {
                console.warn(refDeprecatedInfo);
            }
        });

        provide(editorInfoCtxKey, {
            dom,
            editor,
            loading,
        });

        return () => {
            const portalElements = portals.map(([id, P]) => <P key={id} />);
            return (
                <EditorComponent editorRef={props.editorRef} editor={getEditorCallback.value}>
                    {portalElements}
                </EditorComponent>
            );
        };
    },
});
VueEditor['props'] = ['editor', 'editorRef'];
