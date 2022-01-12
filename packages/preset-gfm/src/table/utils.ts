/* Copyright 2021, Milkdown by Mirone. */
import {
    CellSelection,
    cloneTr,
    findParentNode,
    Node as ProsemirrorNode,
    Schema,
    Selection,
    TableMap,
    tableNodeTypes,
    TableRect,
    Transaction,
} from '@milkdown/prose';

export type CellPos = {
    pos: number;
    start: number;
    node: ProsemirrorNode;
};

export const findTable = (selection: Selection) =>
    findParentNode((node) => node.type.spec.tableRole === 'table')(selection);

export const getCellsInColumn =
    (columnIndex: number) =>
    (selection: Selection): CellPos[] | undefined => {
        const table = findTable(selection);
        if (!table) return undefined;
        const map = TableMap.get(table.node);
        if (columnIndex < 0 || columnIndex >= map.width) {
            return undefined;
        }

        return map.cellsInRect({ left: columnIndex, right: columnIndex + 1, top: 0, bottom: map.height }).map((pos) => {
            const node = table.node.nodeAt(pos);
            if (!node) throw new Error();
            const start = pos + table.start;
            return {
                pos: start,
                start: start + 1,
                node,
            };
        });
    };

export const getCellsInRow =
    (rowIndex: number) =>
    (selection: Selection): CellPos[] | undefined => {
        const table = findTable(selection);
        if (!table) return undefined;
        const map = TableMap.get(table.node);
        if (rowIndex < 0 || rowIndex >= map.height) {
            return undefined;
        }

        return map.cellsInRect({ left: 0, right: map.width, top: rowIndex, bottom: rowIndex + 1 }).map((pos) => {
            const node = table.node.nodeAt(pos);
            if (!node) throw new Error();
            const start = pos + table.start;
            return {
                pos: start,
                start: start + 1,
                node,
            };
        });
    };

export const createTable = (schema: Schema, rowsCount = 3, colsCount = 3) => {
    const { cell: tableCell, header_cell: tableHeader, row: tableRow, table } = tableNodeTypes(schema);

    const cells = Array(colsCount)
        .fill(0)
        .map(() => tableCell.createAndFill(null) as ProsemirrorNode);

    const headerCells = Array(colsCount)
        .fill(0)
        .map(() => tableHeader.createAndFill(null) as ProsemirrorNode);

    const rows = Array(rowsCount)
        .fill(0)
        .map((_, i) => tableRow.create(null, i === 0 ? headerCells : cells));

    return table.create(null, rows);
};

export const selectLine = (type: 'row' | 'col') => (index: number) => (tr: Transaction) => {
    const table = findTable(tr.selection);
    const isRowSelection = type === 'row';
    if (table) {
        const map = TableMap.get(table.node);

        // Check if the index is valid
        if (index >= 0 && index < (isRowSelection ? map.height : map.width)) {
            const lastCell = map.positionAt(
                isRowSelection ? index : map.height - 1,
                isRowSelection ? map.width - 1 : index,
                table.node,
            );
            const $lastCell = tr.doc.resolve(table.start + lastCell);

            const createCellSelection = isRowSelection ? CellSelection.rowSelection : CellSelection.colSelection;

            const firstCell = map.positionAt(isRowSelection ? index : 0, isRowSelection ? 0 : index, table.node);
            const $firstCell = tr.doc.resolve(table.start + firstCell);
            return cloneTr(tr.setSelection(createCellSelection($lastCell, $firstCell) as unknown as Selection));
        }
    }
    return tr;
};

export const getCellsInTable = (selection: Selection) => {
    const table = findTable(selection);
    if (!table) {
        return;
    }
    const map = TableMap.get(table.node);
    const cells = map.cellsInRect({
        left: 0,
        right: map.width,
        top: 0,
        bottom: map.height,
    });
    return cells.map((nodePos) => {
        const node = table.node.nodeAt(nodePos);
        const pos = nodePos + table.start;
        return { pos, start: pos + 1, node };
    });
};

export const selectTable = (tr: Transaction) => {
    const cells = getCellsInTable(tr.selection);
    if (cells) {
        const $firstCell = tr.doc.resolve(cells[0].pos);
        const $lastCell = tr.doc.resolve(cells[cells.length - 1].pos);
        return cloneTr(tr.setSelection(new CellSelection($lastCell, $firstCell) as unknown as Selection));
    }
    return tr;
};

export function addRowWithAlignment(tr: Transaction, { map, tableStart, table }: TableRect, row: number) {
    const rowPos = Array(row)
        .fill(0)
        .reduce((acc, _, i) => {
            return acc + table.child(i).nodeSize;
        }, tableStart);

    const { cell: cellType, row: rowType } = tableNodeTypes(table.type.schema);

    const cells = Array(map.width)
        .fill(0)
        .map((_, col) => {
            const headerCol = table.nodeAt(map.map[col]);
            return cellType.createAndFill({ alignment: headerCol?.attrs.alignment }) as ProsemirrorNode;
        });

    tr.insert(rowPos, rowType.create(null, cells));
    return tr;
}
