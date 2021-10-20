/* Copyright 2021, Milkdown by Mirone. */
import type { Decoration, EditorView, MarkType, Node, NodeType, NodeView, Schema } from '@milkdown/prose';
import { Mark } from '@milkdown/prose';

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
export type ProseView = (...args: ViewParams) => NodeView;

export const getAtom = (id: string, schema: Schema, isNode: boolean) =>
    schema[isNode ? 'nodes' : 'marks'][id] as (NodeType & MarkType) | undefined;
