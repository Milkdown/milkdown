/* Copyright 2021, Milkdown by Mirone. */
import { CellSelection, EditorView, TableMap } from '@milkdown/prose';

import { Item } from './actions';

export const getCellSelection = (view: EditorView): CellSelection => view.state.selection as unknown as CellSelection;

export const isFirstRowSelected = (selection: CellSelection) => {
    const map = TableMap.get(selection.$anchorCell.node(-1));
    const start = selection.$anchorCell.start(-1);
    const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: 0,
        bottom: 1,
    });
    const selectedCells = map.cellsInRect(
        map.rectBetween(selection.$anchorCell.pos - start, selection.$headCell.pos - start),
    );

    for (let i = 0, count = cells.length; i < count; i++) {
        if (selectedCells.indexOf(cells[i]) === -1) {
            return false;
        }
    }
    return true;
};

export const calculateItem = (actions: Record<string, Item>, view: EditorView) => {
    Object.values(actions).forEach((item) => {
        const disable = item.disable?.(view);
        if (disable) {
            item.$.classList.add('hide');
            return;
        }
        item.$.classList.remove('hide');
    });
};
