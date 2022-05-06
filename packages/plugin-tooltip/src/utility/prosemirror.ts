/* Copyright 2021, Milkdown by Mirone. */
import { findParentNode } from '@milkdown/prose';
import { MarkType, Node, NodeType } from '@milkdown/prose/model';
import { EditorState, TextSelection } from '@milkdown/prose/state';

export type Position = {
    start: number;
    end: number;
};

export const hasMark = (editorState: EditorState, type?: MarkType): boolean => {
    if (!type) {
        return false;
    }
    const { from, to } = editorState.selection;

    return editorState.doc.rangeHasMark(from, from === to ? to + 1 : to, type);
};

export const isTextSelection = (editorState: EditorState): boolean => {
    const { selection } = editorState;
    if (selection instanceof TextSelection) {
        const text = editorState.doc.textBetween(selection.from, selection.to);

        if (!text) return false;

        return true;
    }
    return false;
};

export const isInCodeFence = (editorState: EditorState): boolean =>
    Boolean(findParentNode((node) => !!node.type.spec.code)(editorState.selection));

export const isTextAndNotHasMark = (editorState: EditorState, mark?: MarkType): boolean =>
    !isTextSelection(editorState) || isInCodeFence(editorState) || hasMark(editorState, mark);

export const equalNodeType = (nodeType: NodeType, node: Node) => {
    return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType;
};
