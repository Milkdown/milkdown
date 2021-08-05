import type { EditorView } from 'prosemirror-view';

type Result = [top: number, left: number];

export const calculateNodePosition = (
    view: EditorView,
    target: HTMLElement,
    handler: (selectedRect: DOMRect, targetRect: DOMRect, parentRect: DOMRect) => Result,
) => {
    const state = view.state;
    const { from } = state.selection;

    const node = view.domAtPos(from).node;
    if (!(node instanceof HTMLElement)) {
        throw new Error();
    }

    const selectedNodeRect = node.getBoundingClientRect();
    const targetNodeRect = target.getBoundingClientRect();
    const parentNodeRect = target.parentElement?.getBoundingClientRect();
    if (!parentNodeRect) {
        throw new Error();
    }

    const [top, left] = handler(selectedNodeRect, targetNodeRect, parentNodeRect);

    target.style.top = top + 'px';
    target.style.left = left + 'px';
};

type Pos = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export const calculateTextPosition = (
    view: EditorView,
    target: HTMLElement,
    handler: (start: Pos, end: Pos, targetRect: DOMRect, parentRect: DOMRect) => Result,
) => {
    const state = view.state;
    const { from, to } = state.selection;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    const targetNodeRect = target.getBoundingClientRect();
    const parentNodeRect = target.parentElement?.getBoundingClientRect();
    if (!parentNodeRect) {
        throw new Error();
    }

    const [top, left] = handler(start, end, targetNodeRect, parentNodeRect);

    target.style.top = top + 'px';
    target.style.left = left + 'px';
};
