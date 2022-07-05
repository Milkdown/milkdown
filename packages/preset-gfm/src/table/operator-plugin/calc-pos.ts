/* Copyright 2021, Milkdown by Mirone. */

import { missingRootElement } from '@milkdown/exception';
import { calculateNodePosition } from '@milkdown/prose';
import { EditorView } from '@milkdown/prose/view';

import { CellSelection } from '../plugin';

export const calculatePosition = (view: EditorView, dom: HTMLElement) => {
    const { selection } = view.state as unknown as { selection: CellSelection };
    const isCol = selection.isColSelection();
    const isRow = selection.isRowSelection();

    calculateNodePosition(view, dom, (selected, target, parent) => {
        const $editor = dom.parentElement;
        if (!$editor) {
            throw missingRootElement();
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
