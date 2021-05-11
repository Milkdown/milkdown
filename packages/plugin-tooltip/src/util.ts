import { Command } from 'prosemirror-commands';
import type { Node, MarkType, Mark } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

export type Position = {
    start: number;
    end: number;
};

export const elementIsTag = (element: HTMLElement, tagName: string): boolean =>
    element.tagName === tagName.toUpperCase();

export const icon = (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'icon material-icons material-icons-outlined';
    return span;
};

export const input = (): HTMLDivElement => {
    const div = document.createElement('div');
    div.className = 'group';
    const inputEl = document.createElement('input');
    inputEl.className = 'icon input';
    const confirm = icon('check_circle');
    div.appendChild(inputEl);
    div.appendChild(confirm);

    return div;
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
        if (markPos.start > -1) {
            return false;
        }
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
