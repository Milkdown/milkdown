/* Copyright 2021, Milkdown by Mirone. */
import type { Decoration, EditorView, MarkType, Node, NodeType, NodeView, Schema } from '@milkdown/prose';
import { Mark } from '@milkdown/prose';

import type { Editor } from '../editor';

export type NodeViewParams = [node: Node, view: EditorView, getPos: () => number, decorations: Decoration[]];
export type MarkViewParams = [mark: Mark, view: EditorView, getPos: boolean, decorations: Decoration[]];
export type ViewParams = [
    atom: Node | Mark,
    view: EditorView,
    getPos: (() => number) | boolean,
    decorations: Decoration[],
];

export type NodeViewFactory = (editor: Editor, nodeType: NodeType, ...params: NodeViewParams) => NodeView;
export type MarkViewFactory = (editor: Editor, markType: MarkType, ...params: MarkViewParams) => NodeView;
export type ViewFactory = (editor: Editor, atomType: NodeType | MarkType, ...params: ViewParams) => NodeView;
export type ProseView = (...args: ViewParams) => NodeView;

export const getAtom = (id: string, schema: Schema, isNode: boolean) =>
    schema[isNode ? 'nodes' : 'marks'][id] as (NodeType & MarkType) | undefined;
