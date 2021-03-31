import { Node, Mark, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export function hasText(node: Node): node is Node & { text: string } {
    return node.isText;
}

export function maybeMerge(a: Node, b: Node) {
    if (hasText(a) && hasText(b) && Mark.sameSet(a.marks, b.marks)) {
        return a.withText(a.text + b.text);
    }
    return;
}

export interface ViewPlugin<S extends Schema = Schema> {
    update?: ((view: EditorView<S>, prevState: EditorState<S>) => void) | null;
    destroy?: (() => void) | null;
}
