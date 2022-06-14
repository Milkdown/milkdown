/* Copyright 2021, Milkdown by Mirone. */

import { Fragment, Node, NodeSpec, NodeType, ResolvedPos } from '@milkdown/prose/model';
import { Command, EditorState, TextSelection, Transaction } from '@milkdown/prose/state';

import { CellSelection } from './cell-selection';
import { tableNodeTypes } from './schema';
import { Rect, TableMap } from './table-map';
import {
    addColSpan,
    cellAround,
    cellWrapping,
    columnIsHeader,
    isInTable,
    moveCellForward,
    removeColSpan,
    selectionCell,
    setAttr,
} from './util';

// Helper to get the selected rectangle in a table, if any. Adds table
// map, table node, and table start offset to the object for
// convenience.
export function selectedRect(state: EditorState): Required<Rect> {
    const sel = state.selection,
        $pos = selectionCell(state) as ResolvedPos;
    const table = $pos.node(-1),
        tableStart = $pos.start(-1),
        map = TableMap.get(table);
    let rect;
    if (sel instanceof CellSelection)
        rect = map.rectBetween(sel.$anchorCell.pos - tableStart, sel.$headCell.pos - tableStart);
    else rect = map.findCell($pos.pos - tableStart);
    rect.tableStart = tableStart;
    rect.map = map;
    rect.table = table;
    return rect as Required<Rect>;
}

// Add a column at the given position in a table.
export function addColumn(tr: Transaction, { map, tableStart, table }: Rect, col: number) {
    map = map as TableMap;
    table = table as Node;
    tableStart = tableStart as number;
    let refColumn: number | null = col > 0 ? -1 : 0;
    if (columnIsHeader(map, table, col + refColumn)) refColumn = col == 0 || col == map.width ? null : 0;

    for (let row = 0; row < map.height; row++) {
        const index = row * map.width + col;
        // If this position falls inside a col-spanning cell
        if (col > 0 && col < map.width && map.map[index - 1] == map.map[index]) {
            const pos = map.map[index] as number,
                cell = table.nodeAt(pos) as Node;
            tr.setNodeMarkup(tr.mapping.map(tableStart + pos), null, addColSpan(cell.attrs, col - map.colCount(pos)));
            // Skip ahead if rowspan > 1
            row += cell.attrs['rowspan'] - 1;
        } else {
            const offset = map.map[index + (refColumn as number)] as number;
            const type =
                refColumn == null ? tableNodeTypes(table.type.schema).cell : (table.nodeAt(offset) as Node).type;
            const pos = map.positionAt(row, col, table);
            tr.insert(tr.mapping.map(tableStart + pos), type.createAndFill());
        }
    }
    return tr;
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command to add a column before the column with the selection.
export const addColumnBefore: Command = (state, dispatch) => {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state);
        dispatch(addColumn(state.tr, rect, rect.left));
    }
    return true;
};

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command to add a column after the column with the selection.
export const addColumnAfter: Command = (state, dispatch) => {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state);
        dispatch(addColumn(state.tr, rect, rect.right));
    }
    return true;
};

export function removeColumn(tr: Transaction, { map, table, tableStart }: Rect, col: number) {
    map = map as TableMap;
    table = table as Node;
    tableStart = tableStart as number;
    const mapStart = tr.mapping.maps.length;
    for (let row = 0; row < map.height; ) {
        const index = row * map.width + col,
            pos = map.map[index] as number,
            cell = table.nodeAt(pos) as Node;
        // If this is part of a col-spanning cell
        if ((col > 0 && map.map[index - 1] == pos) || (col < map.width - 1 && map.map[index + 1] == pos)) {
            tr.setNodeMarkup(
                tr.mapping.slice(mapStart).map(tableStart + pos),
                null,
                removeColSpan(cell.attrs, col - map.colCount(pos)),
            );
        } else {
            const start = tr.mapping.slice(mapStart).map(tableStart + pos);
            tr.delete(start, start + cell.nodeSize);
        }
        row += cell.attrs['rowspan'];
    }
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Command function that removes the selected columns from a table.
export const deleteColumn: Command = (state, dispatch) => {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state) as Required<Rect>,
            tr = state.tr;
        if (rect.left == 0 && rect.right == rect.map.width) return false;
        for (let i = rect.right - 1; ; i--) {
            removeColumn(tr, rect, i);
            if (i == rect.left) break;
            rect.table = (rect.tableStart ? tr.doc.nodeAt(rect.tableStart - 1) : tr.doc) as Node;
            rect.map = TableMap.get(rect.table);
        }
        dispatch(tr);
    }
    return true;
};

export function rowIsHeader(map: TableMap, table: Node, row: number) {
    const headerCell = tableNodeTypes(table.type.schema).header_cell;
    for (let col = 0; col < map.width; col++) {
        const offset = map.map[col + row * map.width] as number;
        if ((table.nodeAt(offset) as Node).type != headerCell) return false;
    }
    return true;
}

export function addRow(tr: Transaction, { map, tableStart, table }: Rect, row: number) {
    map = map as TableMap;
    table = table as Node;
    tableStart = tableStart as number;
    let rowPos = tableStart;
    for (let i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
    const cells = [];
    let refRow: number | null = row > 0 ? -1 : 0;
    if (rowIsHeader(map, table, row + refRow)) refRow = row == 0 || row == map.height ? null : 0;
    for (let col = 0, index = map.width * row; col < map.width; col++, index++) {
        // Covered by a rowspan cell
        if (row > 0 && row < map.height && map.map[index] == map.map[index - map.width]) {
            const pos = map.map[index] as number,
                attrs = (table.nodeAt(pos) as Node).attrs;
            tr.setNodeMarkup(tableStart + pos, null, setAttr(attrs, 'rowspan', attrs['rowspan'] + 1));
            col += attrs['colspan'] - 1;
        } else {
            const type =
                refRow == null
                    ? tableNodeTypes(table.type.schema).cell
                    : (table.nodeAt(map.map[index + refRow * map.width] as number) as Node).type;
            cells.push(type.createAndFill());
        }
    }
    tr.insert(rowPos, tableNodeTypes(table.type.schema).row.create(null, cells));
    return tr;
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Add a table row before the selection.
export function addRowBefore(state: EditorState, dispatch?: (tr: Transaction) => boolean) {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state);
        dispatch(addRow(state.tr, rect, rect.top));
    }
    return true;
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Add a table row after the selection.
export function addRowAfter(state: EditorState, dispatch?: (tr: Transaction) => boolean) {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state);
        dispatch(addRow(state.tr, rect, rect.bottom));
    }
    return true;
}

export function removeRow(tr: Transaction, { map, tableStart, table }: Rect, row: number) {
    map = map as TableMap;
    table = table as Node;
    tableStart = tableStart as number;
    let rowPos = 0;
    for (let i = 0; i < row; i++) rowPos += table.child(i).nodeSize;
    const nextRow = rowPos + table.child(row).nodeSize;

    const mapFrom = tr.mapping.maps.length;
    tr.delete(rowPos + tableStart, nextRow + tableStart);

    for (let col = 0, index = row * map.width; col < map.width; col++, index++) {
        const pos = map.map[index] as number;
        if (row > 0 && pos == map.map[index - map.width]) {
            // If this cell starts in the row above, simply reduce its rowspan
            const attrs = (table.nodeAt(pos) as Node).attrs;
            tr.setNodeMarkup(
                tr.mapping.slice(mapFrom).map(pos + tableStart),
                null,
                setAttr(attrs, 'rowspan', attrs['rowspan'] - 1),
            );
            col += attrs['colspan'] - 1;
        } else if (row < map.width && pos == map.map[index + map.width]) {
            // Else, if it continues in the row below, it has to be moved down
            const cell = table.nodeAt(pos) as Node;
            const copy = cell.type.create(setAttr(cell.attrs, 'rowspan', cell.attrs['rowspan'] - 1), cell.content);
            const newPos = map.positionAt(row + 1, col, table);
            tr.insert(tr.mapping.slice(mapFrom).map(tableStart + newPos), copy);
            col += cell.attrs['colspan'] - 1;
        }
    }
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Remove the selected rows from a table.
export const deleteRow: Command = (state, dispatch) => {
    if (!isInTable(state)) return false;
    if (dispatch) {
        const rect = selectedRect(state) as Required<Rect>,
            tr = state.tr;
        if (rect.top == 0 && rect.bottom == rect.map.height) return false;
        for (let i = rect.bottom - 1; ; i--) {
            removeRow(tr, rect, i);
            if (i == rect.top) break;
            rect.table = rect.tableStart ? (tr.doc.nodeAt(rect.tableStart - 1) as Node) : tr.doc;
            rect.map = TableMap.get(rect.table);
        }
        dispatch(tr);
    }
    return true;
};

function isEmpty(cell: Node) {
    const c = cell.content;
    return c.childCount == 1 && (c.firstChild as Node).isTextblock && (c.firstChild as Node).childCount == 0;
}

function cellsOverlapRectangle({ width, height, map }: TableMap, rect: Rect) {
    let indexTop = rect.top * width + rect.left,
        indexLeft = indexTop;
    let indexBottom = (rect.bottom - 1) * width + rect.left,
        indexRight = indexTop + (rect.right - rect.left - 1);
    for (let i = rect.top; i < rect.bottom; i++) {
        if (
            (rect.left > 0 && map[indexLeft] == map[indexLeft - 1]) ||
            (rect.right < width && map[indexRight] == map[indexRight + 1])
        )
            return true;
        indexLeft += width;
        indexRight += width;
    }
    for (let i = rect.left; i < rect.right; i++) {
        if (
            (rect.top > 0 && map[indexTop] == map[indexTop - width]) ||
            (rect.bottom < height && map[indexBottom] == map[indexBottom + width])
        )
            return true;
        indexTop++;
        indexBottom++;
    }
    return false;
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Merge the selected cells into a single cell. Only available when
// the selected cells' outline forms a rectangle.
export function mergeCells(state: EditorState, dispatch?: (tr: Transaction) => boolean) {
    const sel = state.selection;
    if (!(sel instanceof CellSelection) || sel.$anchorCell.pos == sel.$headCell.pos) return false;
    const rect = selectedRect(state) as Required<Rect>,
        { map } = rect;
    if (cellsOverlapRectangle(map as TableMap, rect)) return false;
    if (dispatch) {
        const tr = state.tr,
            seen: Record<number, boolean> = {};
        let content = Fragment.empty,
            mergedPos,
            mergedCell;
        for (let row = rect.top; row < rect.bottom; row++) {
            for (let col = rect.left; col < rect.right; col++) {
                const cellPos = map.map[row * map.width + col] as number,
                    cell = rect.table.nodeAt(cellPos) as Node;
                if (seen[cellPos]) continue;
                seen[cellPos] = true;
                if (mergedPos == null) {
                    mergedPos = cellPos;
                    mergedCell = cell;
                } else {
                    if (!isEmpty(cell)) content = content.append(cell.content);
                    const mapped = tr.mapping.map(cellPos + rect.tableStart);
                    tr.delete(mapped, mapped + cell.nodeSize);
                }
            }
        }
        mergedCell = mergedCell as Node;
        mergedPos = mergedPos as number;
        tr.setNodeMarkup(
            mergedPos + rect.tableStart,
            null,
            setAttr(
                addColSpan(
                    mergedCell.attrs,
                    mergedCell.attrs['colspan'],
                    rect.right - rect.left - mergedCell.attrs['colspan'],
                ),
                'rowspan',
                rect.bottom - rect.top,
            ),
        );
        if (content.size) {
            const end = mergedPos + 1 + mergedCell.content.size;
            const start = isEmpty(mergedCell) ? mergedPos + 1 : end;
            tr.replaceWith(start + rect.tableStart, end + rect.tableStart, content);
        }
        tr.setSelection(new CellSelection(tr.doc.resolve(mergedPos + rect.tableStart)));
        dispatch(tr);
    }
    return true;
}
// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Split a selected cell, whose rowpan or colspan is greater than one,
// into smaller cells. Use the first cell type for the new cells.
export function splitCell(state: EditorState, dispatch?: (tr: Transaction) => boolean) {
    const nodeTypes = tableNodeTypes(state.schema);
    return splitCellWithType(({ node }) => {
        return nodeTypes[node.type.spec['tableRole']];
    })(state, dispatch);
}

// :: (getCellType: ({ row: number, col: number, node: Node}) → NodeType) → (EditorState, dispatch: ?(tr: Transaction)) → bool
// Split a selected cell, whose rowpan or colspan is greater than one,
// into smaller cells with the cell type (th, td) returned by getType function.
export function splitCellWithType(getCellType: (pos: { row: number; col: number; node: Node }) => NodeType) {
    return (state: EditorState, dispatch?: (tr: Transaction) => boolean) => {
        const sel = state.selection;
        let cellNode, cellPos;
        if (!(sel instanceof CellSelection)) {
            cellNode = cellWrapping(sel.$from);
            if (!cellNode) return false;
            cellPos = (cellAround(sel.$from) as ResolvedPos).pos;
        } else {
            if (sel.$anchorCell.pos != sel.$headCell.pos) return false;
            cellNode = sel.$anchorCell.nodeAfter as Node;
            cellPos = sel.$anchorCell.pos;
        }
        if (cellNode.attrs['colspan'] == 1 && cellNode.attrs['rowspan'] == 1) {
            return false;
        }
        if (dispatch) {
            let baseAttrs = cellNode.attrs;
            const attrs = [],
                colwidth = baseAttrs['colwidth'];
            if (baseAttrs['rowspan'] > 1) baseAttrs = setAttr(baseAttrs, 'rowspan', 1);
            if (baseAttrs['colspan'] > 1) baseAttrs = setAttr(baseAttrs, 'colspan', 1);
            const rect = selectedRect(state) as Required<Rect>,
                tr = state.tr;
            for (let i = 0; i < rect.right - rect.left; i++)
                attrs.push(
                    colwidth
                        ? setAttr(baseAttrs, 'colwidth', colwidth && colwidth[i] ? [colwidth[i]] : null)
                        : baseAttrs,
                );
            let lastCell;
            for (let row = rect.top; row < rect.bottom; row++) {
                let pos = rect.map.positionAt(row, rect.left, rect.table);
                if (row == rect.top) pos += cellNode.nodeSize;
                for (let col = rect.left, i = 0; col < rect.right; col++, i++) {
                    if (col == rect.left && row == rect.top) continue;
                    tr.insert(
                        (lastCell = tr.mapping.map(pos + rect.tableStart, 1)),
                        getCellType({ node: cellNode, row, col }).createAndFill(attrs[i]) as Node,
                    );
                }
            }
            tr.setNodeMarkup(cellPos, getCellType({ node: cellNode, row: rect.top, col: rect.left }), attrs[0]);
            if (sel instanceof CellSelection) {
                let pos: ResolvedPos | undefined = undefined;
                if (lastCell) {
                    pos = tr.doc.resolve(lastCell);
                }
                tr.setSelection(new CellSelection(tr.doc.resolve(sel.$anchorCell.pos), pos));
            }
            dispatch(tr);
        }
        return true;
    };
}

// :: (string, any) → (EditorState, dispatch: ?(tr: Transaction)) → bool
// Returns a command that sets the given attribute to the given value,
// and is only available when the currently selected cell doesn't
// already have that attribute set to that value.
export function setCellAttr<T>(name: string, value: T): Command {
    return (state, dispatch) => {
        if (!isInTable(state)) return false;
        const $cell = selectionCell(state) as ResolvedPos;
        if (($cell.nodeAfter as Node).attrs[name] === value) return false;
        if (dispatch) {
            const tr = state.tr;
            if (state.selection instanceof CellSelection)
                state.selection.forEachCell((node, pos) => {
                    if (node.attrs[name] !== value) tr.setNodeMarkup(pos, null, setAttr(node.attrs, name, value));
                });
            else tr.setNodeMarkup($cell.pos, null, setAttr(($cell.nodeAfter as Node).attrs, name, value));
            dispatch(tr);
        }
        return true;
    };
}

function isHeaderEnabledByType(type: string, rect: Required<Rect>, types: Record<string, NodeSpec>) {
    // Get cell positions for first row or first column
    const cellPositions = rect.map.cellsInRect({
        left: 0,
        top: 0,
        right: type == 'row' ? rect.map.width : 1,
        bottom: type == 'column' ? rect.map.height : 1,
    });

    for (let i = 0; i < cellPositions.length; i++) {
        const cell = rect.table.nodeAt(cellPositions[i] as number);
        if (cell && cell.type !== types['header_cell']) {
            return false;
        }
    }

    return true;
}

// Toggles between row/column header and normal cells (Only applies to first row/column).
// For deprecated behavior pass `useDeprecatedLogic` in options with true.
export function toggleHeader(type: string) {
    return function (state: EditorState, dispatch?: (tr: Transaction) => boolean) {
        if (!isInTable(state)) return false;
        if (dispatch) {
            const types = tableNodeTypes(state.schema);
            const rect = selectedRect(state),
                tr = state.tr;

            const isHeaderRowEnabled = isHeaderEnabledByType('row', rect, types);
            const isHeaderColumnEnabled = isHeaderEnabledByType('column', rect, types);

            const isHeaderEnabled =
                type === 'column' ? isHeaderRowEnabled : type === 'row' ? isHeaderColumnEnabled : false;

            const selectionStartsAt = isHeaderEnabled ? 1 : 0;

            const cellsRect =
                type == 'column'
                    ? new Rect(0, selectionStartsAt, 1, rect.map.height)
                    : type == 'row'
                    ? new Rect(selectionStartsAt, 0, rect.map.width, 1)
                    : rect;

            const newType =
                type == 'column'
                    ? isHeaderColumnEnabled
                        ? types.cell
                        : types.header_cell
                    : type == 'row'
                    ? isHeaderRowEnabled
                        ? types.cell
                        : types.header_cell
                    : types.cell;

            rect.map.cellsInRect(cellsRect).forEach((relativeCellPos) => {
                const cellPos = relativeCellPos + rect.tableStart;
                const cell = tr.doc.nodeAt(cellPos);

                if (cell) {
                    tr.setNodeMarkup(cellPos, newType, cell.attrs);
                }
            });

            dispatch(tr);
        }
        return true;
    };
}

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Toggles whether the selected row contains header cells.
export const toggleHeaderRow = toggleHeader('row');

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Toggles whether the selected column contains header cells.
export const toggleHeaderColumn = toggleHeader('column');

// :: (EditorState, dispatch: ?(tr: Transaction)) → bool
// Toggles whether the selected cells are header cells.
export const toggleHeaderCell = toggleHeader('cell');

function findNextCell($cell: ResolvedPos, dir: number) {
    if (dir < 0) {
        const before = $cell.nodeBefore;
        if (before) return $cell.pos - before.nodeSize;
        for (let row = $cell.index(-1) - 1, rowEnd = $cell.before(); row >= 0; row--) {
            const rowNode = $cell.node(-1).child(row);
            if (rowNode.childCount) return rowEnd - 1 - (rowNode.lastChild as Node).nodeSize;
            rowEnd -= rowNode.nodeSize;
        }
    } else {
        if ($cell.index() < $cell.parent.childCount - 1) return $cell.pos + ($cell.nodeAfter as Node).nodeSize;
        const table = $cell.node(-1);
        for (let row = $cell.indexAfter(-1), rowStart = $cell.after(); row < table.childCount; row++) {
            const rowNode = table.child(row);
            if (rowNode.childCount) return rowStart + 1;
            rowStart += rowNode.nodeSize;
        }
    }
    return;
}

// Returns a command for selecting the next (direction=1) or previous
// (direction=-1) cell in a table.
export function goToNextCell(direction: number): Command {
    return (state, dispatch) => {
        if (!isInTable(state)) return false;
        const cell = findNextCell(selectionCell(state) as ResolvedPos, direction);
        if (cell == null) return false;
        if (dispatch) {
            const $cell = state.doc.resolve(cell);
            dispatch(state.tr.setSelection(TextSelection.between($cell, moveCellForward($cell))).scrollIntoView());
        }
        return true;
    };
}

// Deletes the table around the selection, if any.
export const deleteTable: Command = (state, dispatch) => {
    const $pos = state.selection.$anchor;
    for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (node.type.spec['tableRole'] == 'table') {
            if (dispatch) dispatch(state.tr.delete($pos.before(d), $pos.after(d)).scrollIntoView());
            return true;
        }
    }
    return false;
};
