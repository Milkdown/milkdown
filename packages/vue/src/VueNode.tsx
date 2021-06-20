import { provide, defineComponent, watchEffect, ref, PropType } from 'vue';

import { Editor } from '@milkdown/core';
import { Node } from 'prosemirror-model';
import { Decoration, EditorView } from 'prosemirror-view';

export type NodeContext = {
    editor: Editor;
    node: Node;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

type Prepend<T, U extends unknown[]> = [T, ...U];
type Keys_<T extends Record<string, unknown>, U extends PropertyKey[]> = {
    [P in keyof T]: Record<string, unknown> extends Omit<T, P> ? [P] : Prepend<P, Keys_<Omit<T, P>, U>>;
}[keyof T];
type Keys<T extends Record<string, unknown>> = Keys_<T, []>;

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

export const Content = defineComponent({
    props: {
        dom: Object as PropType<HTMLElement>,
    },
    setup(props) {
        const containerRef = ref<HTMLDivElement | null>(null);
        watchEffect(() => {
            if (!props.dom || !containerRef.value) return;
            containerRef.value.appendChild(props.dom);
        });
        // return () => <div ref={containerRef} />;
        return {
            containerRef,
        };
    },

    render() {
        return <div ref="containerRef" />;
    },
});
// export const Content = defineComponent((props: { dom: HTMLElement }) => {
//     const containerRef = ref<HTMLDivElement | null>(null);
//     watchEffect(() => {
//         if (!props.dom || !containerRef.value) return;
//         containerRef.value.appendChild(props.dom);
//     });
//     return () => <div ref={containerRef} />;
// });
// Content.props = ['dom'];
