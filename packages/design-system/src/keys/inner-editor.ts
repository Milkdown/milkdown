/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView, Node } from '@milkdown/prose';

import { createThemeSliceKey } from '../manager';

type InnerEditorRenderer = {
    dom: HTMLElement;
    preview: HTMLElement;
    editor: HTMLElement;
    onUpdate: (node: Node, isInit: boolean) => void;
    onFocus: (node: Node) => void;
    onBlur: (node: Node) => void;
    onDestroy: () => void;
    stopEvent: (event: Event) => boolean;
};
type InnerEditorOptions = {
    view: EditorView;
    getPos: () => number;
    render: (content: string) => void;
};
export const ThemeInnerEditor = createThemeSliceKey<InnerEditorRenderer, InnerEditorOptions, 'inner-editor'>(
    'inner-editor',
);
export type ThemeInnerEditorType = typeof ThemeInnerEditor;
