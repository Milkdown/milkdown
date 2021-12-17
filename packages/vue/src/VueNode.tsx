/* Copyright 2021, Milkdown by Mirone. */
import { Decoration, EditorView, Mark, Node } from '@milkdown/prose';
import { defineComponent, h, InjectionKey, provide } from 'vue';

export type NodeContext = {
    node: Node | Mark;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

export const nodeMetadata: InjectionKey<NodeContext> = Symbol();

export const VueNodeContainer = defineComponent<NodeContext>({
    name: 'milkdown-node-container',
    setup: ({ node, view, getPos, decorations }, context) => {
        provide(nodeMetadata, {
            node,
            view,
            getPos,
            decorations,
        });
        return () => <div data-view-container>{context.slots.default?.()}</div>;
    },
});
VueNodeContainer.props = ['editor', 'node', 'view', 'getPos', 'decorations'];

export const Content = defineComponent<{ isMark?: boolean }>({
    name: 'milkdown-content',
    setup: ({ isMark }) => {
        return () => (isMark ? <span data-view-content /> : <div data-view-content />);
    },
});
Content.props = ['isMark'];
