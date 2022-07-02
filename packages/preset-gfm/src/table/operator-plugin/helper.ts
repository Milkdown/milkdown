/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose/view';

import { CellSelection } from '../plugin';
import { TableMap } from '../plugin/table-map';
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
        if (selectedCells.indexOf(cells[i] as number) === -1) {
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
