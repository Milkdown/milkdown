/* Copyright 2021, Milkdown by Mirone. */

import type { Mark, Node } from 'prosemirror-model';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';

export type NodeViewParams = [node: Node, view: EditorView, getPos: () => number, decorations: Decoration[]];
export type MarkViewParams = [mark: Mark, view: EditorView, getPos: boolean, decorations: Decoration[]];
export type ViewParams = [
    atom: Node | Mark,
    view: EditorView,
    getPos: (() => number) | boolean,
    decorations: Decoration[],
];

export type NodeViewFactory = (...params: NodeViewParams) => NodeView;
export type MarkViewFactory = (...params: MarkViewParams) => NodeView;
export type ViewFactory = (...params: ViewParams) => NodeView;
