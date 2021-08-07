import { findNodeInSelection } from '@milkdown/utils';
import { MarkType, Node, Mark } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

export const findMarkByType = (editorState: EditorState, type: MarkType): Node | undefined => {
    return findNodeInSelection((node) => Boolean(type.isInSet(node.marks)))(editorState.selection, editorState.doc)
        ?.node;
};

export const findMarkPosition = (editorState: EditorState, mark: Mark) => {
    let markPos = { start: -1, end: -1 };

    const result = findNodeInSelection((node) => Boolean(mark.isInSet(node.marks)))(
        editorState.selection,
        editorState.doc,
    );

    if (result) {
        markPos = {
            start: result.pos,
            end: result.pos + Math.max(result.node.textContent.length, 1),
        };
    }
    return markPos;
};
