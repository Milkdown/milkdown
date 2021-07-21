import type { Editor } from '../editor';
import type { EditorState, Transaction } from 'prosemirror-state';
import type { Decoration, EditorView, NodeView } from 'prosemirror-view';
import type { Node, Schema, MarkType, NodeType } from 'prosemirror-model';

import { Mark } from 'prosemirror-model';

export const hasText = (node: Node): node is Node & { text: string } => node.isText;

export const maybeMerge = (a: Node, b: Node): Node | undefined => {
    if (hasText(a) && hasText(b) && Mark.sameSet(a.marks, b.marks)) {
        return a.withText(a.text + b.text);
    }
    return;
};

export type Command = (state: EditorState<Schema>, dispatch?: (tr: Transaction<Schema>) => void) => void;

export type NodeViewParams = [node: Node, view: EditorView, getPos: () => number, decorations: Decoration[]];
export type MarkViewParams = [mark: Mark, view: EditorView, getPos: boolean, decorations: Decoration[]];
export type ViewParams = [
    atom: Node | Mark,
    view: EditorView,
    getPos: () => number | boolean,
    decorations: Decoration[],
];

export type NodeViewFactory = (editor: Editor, nodeType: NodeType, ...params: NodeViewParams) => NodeView;
export type MarkViewFactory = (editor: Editor, markType: MarkType, ...params: MarkViewParams) => NodeView;
export type ViewFactory = (editor: Editor, atomType: NodeType | MarkType, ...params: ViewParams) => NodeView;
export type ProseView = (...args: NodeViewParams | MarkViewParams) => NodeView;

export const getAtom = (id: string, schema: Schema, isNode: boolean) =>
    schema[isNode ? 'nodes' : 'marks'][id] as (NodeType & MarkType) | undefined;
