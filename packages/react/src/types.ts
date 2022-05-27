/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, Editor } from '@milkdown/core';
import { ViewFactory } from '@milkdown/prose';
import { MutableRefObject, ReactNode, RefObject } from 'react';

import { RenderOptions } from './ReactNodeView';

export type GetEditor = (
    container: HTMLElement,
    renderReact: (
        Component: React.FC<{ children: ReactNode }>,
        renderOptions?: RenderOptions,
    ) => (ctx: Ctx) => ViewFactory,
) => Editor | undefined;

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
