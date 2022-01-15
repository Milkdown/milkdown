/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Decoration, EditorView, Mark, Node } from '@milkdown/prose';
import { defineComponent, h, InjectionKey, provide } from 'vue';

export type NodeContext = {
    ctx: Ctx;
    node: Node | Mark;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

export const nodeMetadata: InjectionKey<NodeContext> = Symbol();

export const VueNodeContainer = defineComponent<NodeContext>({
    name: 'milkdown-node-container',
    setup: ({ node, view, getPos, decorations, ctx }, context) => {
        provide(nodeMetadata, {
            ctx,
            node,
            view,
            getPos,
            decorations,
        });
        return () => <div data-view-container>{context.slots.default?.()}</div>;
    },
});
VueNodeContainer.props = ['ctx', 'editor', 'node', 'view', 'getPos', 'decorations'];

export const Content = defineComponent<{ isInline?: boolean }>({
    name: 'milkdown-content',
    setup: ({ isInline }) => {
        return () => (isInline ? <span data-view-content /> : <div data-view-content />);
    },
});
Content.props = ['isMark'];
