import { findNodeInSelection, findParentNode } from '@milkdown/utils';
import type { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { EditorState, NodeSelection, Selection, TextSelection } from 'prosemirror-state';

export type Position = {
    start: number;
    end: number;
};

export const hasMark = (editorState: EditorState, type: MarkType): boolean => {
    const { from, to } = editorState.selection;

    return editorState.doc.rangeHasMark(from, to, type);
};

export const findMarkByType = (editorState: EditorState, type: MarkType): Node | undefined => {
    return findNodeInSelection((node) => Boolean(type.isInSet(node.marks)))(editorState.selection, editorState.doc)
        ?.node;
};

export const findMarkPosition = (editorState: EditorState, mark: Mark): Position => {
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

export const isTextSelection = (editorState: EditorState): boolean => editorState.selection instanceof TextSelection;

export const isInCodeFence = (editorState: EditorState): boolean =>
    Boolean(findParentNode((node) => node.type.name === 'fence')(editorState.selection));

export const isTextAndNotHasMark = (editorState: EditorState, mark: MarkType): boolean =>
    !isTextSelection(editorState) || isInCodeFence(editorState) || hasMark(editorState, mark);

export const equalNodeType = (nodeType: NodeType, node: Node) => {
    return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType;
};

export const findChildNode = (selection: Selection, nodeType: NodeType) => {
    if (!(selection instanceof NodeSelection)) {
        return;
    }
    const { node, $from } = selection;
    if (equalNodeType(nodeType, node)) {
        return { node, pos: $from.pos, depth: $from.depth };
    }
    return undefined;
};
