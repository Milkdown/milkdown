/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { Mark, Node } from '@milkdown/prose/model';
import { Decoration, EditorView } from '@milkdown/prose/view';
import { defineComponent, h, InjectionKey, provide } from 'vue';

export type NodeContext = {
    ctx: Ctx;
    node: Node | Mark;
    view: EditorView;
    getPos: boolean | (() => number);
    decorations: Decoration[];
};

export const nodeMetadata: InjectionKey<NodeContext> = Symbol();

export const VueNodeContainer = defineComponent<NodeContext & { as: string }>({
    name: 'milkdown-node-container',
    setup: ({ node, view, getPos, decorations, ctx, as }, context) => {
        provide(nodeMetadata, {
            ctx,
            node,
            view,
            getPos,
            decorations,
        });
        return () => h(as, { 'data-view-container': true }, context.slots['default']?.());
    },
});
VueNodeContainer['props'] = ['ctx', 'editor', 'node', 'view', 'getPos', 'decorations', 'as'];

export const Content = defineComponent<{ isInline?: boolean }>({
    name: 'milkdown-content',
    setup: ({ isInline }) => {
        return () => (isInline ? <span data-view-content /> : <div data-view-content />);
    },
});
Content['props'] = ['isInline'];
