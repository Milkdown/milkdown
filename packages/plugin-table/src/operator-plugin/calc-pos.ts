/* Copyright 2021, Milkdown by Mirone. */

import { calculateNodePosition, EditorView } from '@milkdown/prose';
import { CellSelection } from 'prosemirror-tables';

export const calculatePosition = (view: EditorView, dom: HTMLElement) => {
    const { selection } = view.state as unknown as { selection: CellSelection };
    const isCol = selection.isColSelection();
    const isRow = selection.isRowSelection();

    calculateNodePosition(view, dom, (selected, target, parent) => {
        let left = !isRow
            ? selected.left - parent.left + (selected.width - target.width) / 2
            : selected.left - parent.left - target.width / 2 - 8;
        const top = selected.top - parent.top - target.height - (isCol ? 14 : 0) - 14;

        if (left < 0) {
            left = 0;
        }
        return [top, left];
    });
};
