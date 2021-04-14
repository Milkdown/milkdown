import { Node, Mark, Schema } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { Decoration, EditorView } from 'prosemirror-view';

export function hasText(node: Node): node is Node & { text: string } {
    return node.isText;
}

export function maybeMerge(a: Node, b: Node) {
    if (hasText(a) && hasText(b) && Mark.sameSet(a.marks, b.marks)) {
        return a.withText(a.text + b.text);
    }
    return;
}

export interface ViewPlugin {
    update?: ((view: EditorView<Schema>, prevState: EditorState<Schema>) => void) | null;
    destroy?: (() => void) | null;
}

export type Command = (state: EditorState<Schema>, dispatch?: (tr: Transaction<Schema>) => void) => void;

export type NodeView = (node: Node, view: EditorView, getPos: () => number, decorations: Decoration[]) => void;

export type MarkView = (mark: Mark, view: EditorView, getPos: boolean, decorations: Decoration[]) => void;
