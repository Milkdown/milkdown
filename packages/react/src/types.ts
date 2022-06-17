/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor } from '@milkdown/core';
import { Mark, Node } from '@milkdown/prose/model';
import { MarkViewConstructor, NodeViewConstructor } from '@milkdown/prose/view';
import { MutableRefObject, ReactNode, RefObject } from 'react';

import { RenderOptions } from './ReactNodeView';

export type RenderReact<U = never> = <T>(
    Component: React.FC<{ children: ReactNode }>,
    renderOptions?: RenderOptions,
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

export type GetEditor = (container: HTMLElement, renderReact: RenderReact) => Editor | undefined;

export type UseEditorReturn = {
    readonly loading: boolean;
    readonly getInstance: () => Editor | undefined;
    readonly getDom: () => HTMLDivElement | null;
    readonly editor: EditorInfo;
};

export type EditorInfoCtx = {
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    dom: RefObject<HTMLDivElement>;
    editor: MutableRefObject<Editor | undefined>;
};

export type EditorInfo = {
    getEditorCallback: GetEditor;
} & EditorInfoCtx;

export type EditorRef = {
    get: () => Editor | undefined;
    dom: () => HTMLDivElement | null;
};
