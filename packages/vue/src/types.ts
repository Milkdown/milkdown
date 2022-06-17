/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor } from '@milkdown/core';
import type { Mark, Node } from '@milkdown/prose/model';
import { Decoration, DecorationSource, MarkViewConstructor, NodeView, NodeViewConstructor } from '@milkdown/prose/view';
import { Ref } from 'vue';

import { AnyVueComponent } from './utils';

export type RenderOptions = Partial<
    {
        as: string;
        update?: (node: Node, decorations: readonly Decoration[], innerDecorations: DecorationSource) => boolean;
    } & Pick<NodeView, 'ignoreMutation' | 'deselectNode' | 'selectNode' | 'destroy'>
>;

export type RenderVue<U = never> = <T extends Node | Mark = Node | Mark>(
    Component: AnyVueComponent,
    options?: RenderOptions,
) => (
    ctx: Ctx,
) => U extends never
    ? T extends Node
        ? NodeViewConstructor
        : T extends Mark
        ? MarkViewConstructor
        : NodeViewConstructor & MarkViewConstructor
    : U extends Node
    ? NodeViewConstructor
    : U extends Mark
    ? MarkViewConstructor
    : NodeViewConstructor & MarkViewConstructor;

export type GetEditor = (container: HTMLDivElement, renderVue: RenderVue) => Editor;

export type EditorInfoCtx = {
    dom: Ref<HTMLDivElement | null>;
    editor: Ref<Editor | undefined>;
    loading: Ref<boolean>;
};

export type EditorInfo = {
    getEditorCallback: Ref<GetEditor>;
} & EditorInfoCtx;

export type UseEditorReturn = {
    loading: Ref<boolean>;
    getInstance: () => Editor | undefined;
    getDom: () => HTMLDivElement | null;
    editor: EditorInfo;
};
