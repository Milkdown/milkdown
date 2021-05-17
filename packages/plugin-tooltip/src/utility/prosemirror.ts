import type { Command } from 'prosemirror-commands';
import type { Mark, MarkType, Node, NodeType, Schema } from 'prosemirror-model';
import { EditorState, TextSelection, Selection, NodeSelection } from 'prosemirror-state';
import type { Event2Command } from '../item';
import { elementIsTag } from './element';

export type Position = {
    start: number;
    end: number;
};

export const hasMark = (editorState: EditorState, type: MarkType): boolean => {
    const { from, to } = editorState.selection;

    return editorState.doc.rangeHasMark(from, to, type);
};

export const findMarkByType = (editorState: EditorState, type: MarkType): Node | undefined => {
    let found: Node | undefined;
    const { from, to } = editorState.selection;
    editorState.doc.nodesBetween(from, to, (node) => {
        if (found) return false;
        const result = node.marks.find((mark) => mark.type === type);
        if (result) {
            found = node;
        }
        return;
    });

    return found;
};

export const findMarkPosition = (editorState: EditorState, mark: Mark): Position => {
    const { doc, selection } = editorState;
    const { from, to } = selection;
    let markPos = { start: -1, end: -1 };
    doc.nodesBetween(from, to, (node, pos) => {
        // stop recursing if result is found
        if (markPos.start > -1) return false;
        if (markPos.start === -1 && mark.isInSet(node.marks)) {
            markPos = {
                start: pos,
                end: pos + Math.max(node.textContent.length, 1),
            };
        }
        return;
    });

    return markPos;
};

export const isTextSelection = (editorState: EditorState): boolean => editorState.selection instanceof TextSelection;

export const isInCodeFence = (editorState: EditorState): boolean =>
    editorState.selection.$head.parent.type.name === 'fence';

export const isTextAndNotHasMark = (editorState: EditorState, mark: MarkType): boolean =>
    !isTextSelection(editorState) || isInCodeFence(editorState) || hasMark(editorState, mark);

export const modifyLinkCommand = (mark: Mark, markType: MarkType, link: string): Command => (state, dispatch) => {
    if (!dispatch) return false;

    const { start, end } = findMarkPosition(state, mark);
    const { tr } = state;
    const linkMark = markType.create({ ...mark.attrs, href: link });

    tr.removeMark(start, end).addMark(start, end, linkMark).setSelection(new TextSelection(tr.selection.$anchor));
    dispatch(tr.scrollIntoView());

    return true;
};

export const modifyLink = (schema: Schema): Event2Command => (e, view) => {
    const { target } = e;
    const { marks } = schema;
    const { link } = marks;
    if (!(target instanceof HTMLElement)) {
        return () => true;
    }
    if (elementIsTag(target, 'input')) {
        target.focus();
        return () => false;
    }
    if (!elementIsTag(target, 'span')) {
        return () => false;
    }
    const node = findMarkByType(view.state, link);
    if (!node) return () => false;

    const mark = node.marks.find(({ type }) => type === link);
    if (!mark) return () => false;

    const inputEl = target.parentNode?.firstChild;
    if (!(inputEl instanceof HTMLInputElement)) return () => false;

    return modifyLinkCommand(mark, marks.link, inputEl.value);
};

export const modifyImage = (schema: Schema, attr: string): Event2Command => (e, view) => {
    const { target } = e;
    const { nodes } = schema;
    const { image } = nodes;
    if (!(target instanceof HTMLElement)) {
        return () => true;
    }
    if (elementIsTag(target, 'input')) {
        target.focus();
        return () => false;
    }
    if (!elementIsTag(target, 'span')) {
        return () => false;
    }
    const node = findChildNode(view.state.selection, image);
    if (!node) return () => false;

    const parent = target.parentNode;
    if (!parent) return () => false;

    const inputEl = Array.from(parent.children).find((el) => el.tagName === 'INPUT');
    if (!(inputEl instanceof HTMLInputElement)) return () => false;

    return (state, dispatch) => {
        if (!dispatch) return false;

        const { tr } = state;
        tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, [attr]: inputEl.value });
        dispatch(tr.scrollIntoView());

        return true;
    };
};

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
