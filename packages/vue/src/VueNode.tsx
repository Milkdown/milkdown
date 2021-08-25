import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { Decoration, EditorView } from 'prosemirror-view';
import { defineComponent, Fragment, h, InjectionKey, provide, ref, watchEffect } from 'vue';

export type NodeContext = {
    editor: Editor;
    node: Node;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

export const nodeMetadata: InjectionKey<NodeContext> = Symbol();

export const VueNodeContainer = defineComponent(({ editor, node, view, getPos, decorations }: NodeContext, context) => {
    provide(nodeMetadata, {
        editor,
        node,
        view,
        getPos,
        decorations,
    });
    return () => <>{context.slots.default?.() ?? []}</>;
});
VueNodeContainer.props = ['editor', 'node', 'view', 'getPos', 'decorations'];

export const Content = defineComponent((props: { dom: HTMLElement }) => {
    const containerRef = ref<HTMLDivElement | null>(null);
    watchEffect(() => {
        if (!props.dom || !containerRef.value) return;
        containerRef.value.appendChild(props.dom);
    });
    return () => <div ref={containerRef} />;
});
Content.props = ['dom'];
