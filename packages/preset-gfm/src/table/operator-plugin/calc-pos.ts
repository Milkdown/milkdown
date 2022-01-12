/* Copyright 2021, Milkdown by Mirone. */

import { calculateNodePosition, CellSelection, EditorView } from '@milkdown/prose';

export const calculatePosition = (view: EditorView, dom: HTMLElement) => {
    const { selection } = view.state as unknown as { selection: CellSelection };
    const isCol = selection.isColSelection();
    const isRow = selection.isRowSelection();

    calculateNodePosition(view, dom, (selected, target, parent) => {
        const $editor = dom.parentElement;
        if (!$editor) {
            throw new Error();
        }
        let left = !isRow
            ? selected.left - parent.left + (selected.width - target.width) / 2
            : selected.left - parent.left - target.width / 2 - 8;
        const top = selected.top - parent.top - target.height - (isCol ? 14 : 0) - 14 + $editor.scrollTop;

        if (left < 0) {
            left = 0;
        }
        return [top, left];
    });
};
