import type { Editor } from '../editor';
import type { EditorState, Transaction } from 'prosemirror-state';
import type { Decoration, EditorView } from 'prosemirror-view';

import { Node, Mark, Schema, MarkType, NodeType } from 'prosemirror-model';

export function hasText(node: Node): node is Node & { text: string } {
    return node.isText;
}

export function maybeMerge(a: Node, b: Node) {
    if (hasText(a) && hasText(b) && Mark.sameSet(a.marks, b.marks)) {
        return a.withText(a.text + b.text);
    }
    return;
}

export type Command = (state: EditorState<Schema>, dispatch?: (tr: Transaction<Schema>) => void) => void;

type NodeViewParams = [node: Node, view: EditorView, getPos: () => number, decorations: Decoration[]];
type MarkViewParams = [mark: Mark, view: EditorView, getPos: boolean, decorations: Decoration[]];

export type NodeView = (...params: NodeViewParams) => void;
export type MarkView = (...params: MarkViewParams) => void;
export type NodeViewFactory = (editor: Editor, nodeType: NodeType, ...params: NodeViewParams) => NodeView;
export type MarkViewFactory = (editor: Editor, markType: MarkType, ...params: MarkViewParams) => NodeView;
