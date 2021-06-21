import { provide, defineComponent, watchEffect, ref } from 'vue';

import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { Decoration, EditorView } from 'prosemirror-view';
import { Keys } from './utils';

export type NodeContext = {
    editor: Editor;
    node: Node;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

const useProvider = (nodeContext: NodeContext) => {
    Object.entries(nodeContext).forEach(([key, value]) => {
        provide(key, value);
    });
};

const injectedValues: Keys<NodeContext> = ['editor', 'node', 'view', 'getPos', 'decorations'];

export const VueNodeContainer = defineComponent(({ editor, node, view, getPos, decorations }: NodeContext, context) => {
    useProvider({
        editor,
        node,
        view,
        getPos,
        decorations,
    });
    return () => <>{context.slots.default?.() ?? []}</>;
});
VueNodeContainer.props = injectedValues;

export const Content = defineComponent((props: { dom: HTMLElement }) => {
    const containerRef = ref<HTMLDivElement | null>(null);
    watchEffect(() => {
        if (!props.dom || !containerRef.value) return;
        containerRef.value.appendChild(props.dom);
    });
    return () => <div ref={containerRef} />;
});
Content.props = ['dom'];
