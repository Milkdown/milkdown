/* Copyright 2021, Milkdown by Mirone. */

import { Fragment, Node, NodeType, Schema, Slice } from '@milkdown/prose/model';
import { EditorState, Transaction } from '@milkdown/prose/state';
import { Transform } from '@milkdown/prose/transform';

import { CellSelection } from './cell-selection';
import { tableNodeTypes } from './schema';
import { Rect, TableMap } from './table-map';
import { removeColSpan, setAttr } from './util';

// Utilities to help with copying and pasting table cells

// : (Slice) → ?{width: number, height: number, rows: [Fragment]}
// Get a rectangular area of cells from a slice, or null if the outer
// nodes of the slice aren't table cells or rows.
export function pastedCells(slice: Slice) {
    if (!slice.size) return null;
    let { content, openStart, openEnd } = slice;
    while (
        content.childCount == 1 &&
        ((openStart > 0 && openEnd > 0) || (content.firstChild as Node).type.spec['tableRole'] == 'table')
    ) {
        openStart--;
        openEnd--;
        content = (content.firstChild as Node).content;
    }
    const first = content.firstChild as Node,
        role = first.type.spec['tableRole'];
    const schema = first.type.schema,
        rows = [];
    if (role == 'row') {
        for (let i = 0; i < content.childCount; i++) {
            let cells = content.child(i).content;
            const left = i ? 0 : Math.max(0, openStart - 1);
            const right = i < content.childCount - 1 ? 0 : Math.max(0, openEnd - 1);
            if (left || right) cells = fitSlice(tableNodeTypes(schema).row, new Slice(cells, left, right)).content;
            rows.push(cells);
        }
    } else if (role == 'cell' || role == 'header_cell') {
        rows.push(
            openStart || openEnd
                ? fitSlice(tableNodeTypes(schema).row, new Slice(content, openStart, openEnd)).content
                : content,
        );
    } else {
        return null;
    }
    return ensureRectangular(schema, rows);
}

// : (Schema, [Fragment]) → {width: number, height: number, rows: [Fragment]}
// Compute the width and height of a set of cells, and make sure each
// row has the same number of cells.
export type R = { width: number; height: number; rows: Fragment[] };
function ensureRectangular(schema: Schema, rows: Fragment[]): R {
    const widths: number[] = [];
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as Fragment;
        for (let j = row.childCount - 1; j >= 0; j--) {
            const { rowspan, colspan } = row.child(j).attrs;
            for (let r = i; r < i + rowspan; r++) widths[r] = (widths[r] || 0) + colspan;
        }
    }
    let width = 0;
    for (let r = 0; r < widths.length; r++) width = Math.max(width, widths[r] as number);
    for (let r = 0; r < widths.length; r++) {
        if (r >= rows.length) rows.push(Fragment.empty);
        if ((widths[r] as number) < width) {
            const empty = tableNodeTypes(schema).cell.createAndFill(),
                cells = [];
            for (let i = widths[r] as number; i < width; i++) cells.push(empty);
            rows[r] = (rows[r] as Fragment).append(Fragment.from(cells));
        }
    }
    return { height: rows.length, width, rows };
}

export function fitSlice(nodeType: NodeType, slice: Slice) {
    const node = nodeType.createAndFill() as Node;
    const tr = new Transform(node).replace(0, node.content.size, slice);
    return tr.doc;
}

// Clip or extend (repeat) the given set of cells to cover the given
// width and height. Will clip rowspan/colspan cells at the edges when
// they stick out.
export function clipCells({ width, height, rows }: R, newWidth: number, newHeight: number): R {
    if (width != newWidth) {
        const added: number[] = [],
            newRows: Fragment[] = [];
        for (let row = 0; row < rows.length; row++) {
            const frag = rows[row] as Fragment,
                cells = [];
            for (let col = added[row] || 0, i = 0; col < newWidth; i++) {
                let cell = frag.child(i % frag.childCount);
                if (col + cell.attrs['colspan'] > newWidth)
                    cell = cell.type.create(
                        removeColSpan(cell.attrs, cell.attrs['colspan'], col + cell.attrs['colspan'] - newWidth),
                        cell.content,
                    );
                cells.push(cell);
                col += cell.attrs['colspan'];
                for (let j = 1; j < cell.attrs['rowspan']; j++)
                    added[row + j] = (added[row + j] || 0) + cell.attrs['colspan'];
            }
            newRows.push(Fragment.from(cells));
        }
        rows = newRows;
        width = newWidth;
    }

    if (height != newHeight) {
        const newRows = [];
        for (let row = 0, i = 0; row < newHeight; row++, i++) {
            const cells = [],
                source = rows[i % height] as Fragment;
            for (let j = 0; j < source.childCount; j++) {
                let cell = source.child(j);
                if (row + cell.attrs['rowspan'] > newHeight)
                    cell = cell.type.create(
                        setAttr(cell.attrs, 'rowspan', Math.max(1, newHeight - cell.attrs['rowspan'])),
                        cell.content,
                    );
                cells.push(cell);
            }
            newRows.push(Fragment.from(cells));
        }
        rows = newRows;
        height = newHeight;
    }

    return { width, height, rows };
}

// Make sure a table has at least the given width and height. Return
// true if something was changed.
function growTable(
    tr: Transaction,
    map: TableMap,
    table: Node,
    start: number,
    width: number,
    height: number,
    mapFrom: number,
) {
    const schema = tr.doc.type.schema,
        types = tableNodeTypes(schema);
    let empty, emptyHead;
    if (width > map.width) {
        for (let row = 0, rowEnd = 0; row < map.height; row++) {
            const rowNode = table.child(row);
            rowEnd += rowNode.nodeSize;
            const cells = [];
            let add;
            if (rowNode.lastChild == null || rowNode.lastChild.type == types.cell)
                add = empty || (empty = types.cell.createAndFill());
            else add = emptyHead || (emptyHead = types.header_cell.createAndFill());
            for (let i = map.width; i < width; i++) cells.push(add);
            tr.insert(tr.mapping.slice(mapFrom).map(rowEnd - 1 + start), cells);
        }
    }
    if (height > map.height) {
        const cells = [];
        for (let i = 0, start = (map.height - 1) * map.width; i < Math.max(map.width, width); i++) {
            const header =
                i >= map.width ? false : (table.nodeAt(map.map[start + i] as number) as Node).type == types.header_cell;
            cells.push(
                header
                    ? emptyHead || (emptyHead = types.header_cell.createAndFill())
                    : empty || (empty = types.cell.createAndFill()),
            );
        }

        const emptyRow = types.row.create(null, Fragment.from(cells)),
            rows = [];
        for (let i = map.height; i < height; i++) rows.push(emptyRow);
        tr.insert(tr.mapping.slice(mapFrom).map(start + table.nodeSize - 2), rows);
    }
    return !!(empty || emptyHead);
}

// Make sure the given line (left, top) to (right, top) doesn't cross
// any rowspan cells by splitting cells that cross it. Return true if
// something changed.
function isolateHorizontal(
    tr: Transaction,
    map: TableMap,
    table: Node,
    start: number,
    left: number,
    right: number,
    top: number,
    mapFrom: number,
) {
    if (top == 0 || top == map.height) return false;
    let found = false;
    for (let col = left; col < right; col++) {
        const index = top * map.width + col,
            pos = map.map[index] as number;
        if (map.map[index - map.width] == pos) {
            found = true;
            const cell = table.nodeAt(pos) as Node;
            const { top: cellTop, left: cellLeft } = map.findCell(pos);
            tr.setNodeMarkup(
                tr.mapping.slice(mapFrom).map(pos + start),
                null,
                setAttr(cell.attrs, 'rowspan', top - cellTop),
            );
            tr.insert(
                tr.mapping.slice(mapFrom).map(map.positionAt(top, cellLeft, table)),
                cell.type.createAndFill(setAttr(cell.attrs, 'rowspan', cellTop + cell.attrs['rowspan'] - top)) as Node,
            );
            col += cell.attrs['colspan'] - 1;
        }
    }
    return found;
}

// Make sure the given line (left, top) to (left, bottom) doesn't
// cross any colspan cells by splitting cells that cross it. Return
// true if something changed.
function isolateVertical(
    tr: Transaction,
    map: TableMap,
    table: Node,
    start: number,
    top: number,
    bottom: number,
    left: number,
    mapFrom: number,
) {
    if (left == 0 || left == map.width) return false;
    let found = false;
    for (let row = top; row < bottom; row++) {
        const index = row * map.width + left,
            pos = map.map[index] as number;
        if (map.map[index - 1] == pos) {
            found = true;
            const cell = table.nodeAt(pos) as Node,
                cellLeft = map.colCount(pos);
            const updatePos = tr.mapping.slice(mapFrom).map(pos + start);
            tr.setNodeMarkup(
                updatePos,
                null,
                removeColSpan(cell.attrs, left - cellLeft, cell.attrs['colspan'] - (left - cellLeft)),
            );
            tr.insert(
                updatePos + cell.nodeSize,
                cell.type.createAndFill(removeColSpan(cell.attrs, 0, left - cellLeft)) as Node,
            );
            row += cell.attrs['rowspan'] - 1;
        }
    }
    return found;
}

// Insert the given set of cells (as returned by `pastedCells`) into a
// table, at the position pointed at by rect.
export function insertCells(
    state: EditorState,
    dispatch: (tr: Transaction) => void,
    tableStart: number,
    rect: Rect,
    cells: R,
) {
    let table = (tableStart ? state.doc.nodeAt(tableStart - 1) : state.doc) as Node,
        map = TableMap.get(table);
    const { top, left } = rect;
    const right = left + cells.width,
        bottom = top + cells.height;
    const tr = state.tr;
    let mapFrom = 0;
    function recomp() {
        table = (tableStart ? tr.doc.nodeAt(tableStart - 1) : tr.doc) as Node;
        map = TableMap.get(table);
        mapFrom = tr.mapping.maps.length;
    }
    // Prepare the table to be large enough and not have any cells
    // crossing the boundaries of the rectangle that we want to
    // insert into. If anything about it changes, recompute the table
    // map so that subsequent operations can see the current shape.
    if (growTable(tr, map, table, tableStart, right, bottom, mapFrom)) recomp();
    if (isolateHorizontal(tr, map, table, tableStart, left, right, top, mapFrom)) recomp();
    if (isolateHorizontal(tr, map, table, tableStart, left, right, bottom, mapFrom)) recomp();
    if (isolateVertical(tr, map, table, tableStart, top, bottom, left, mapFrom)) recomp();
    if (isolateVertical(tr, map, table, tableStart, top, bottom, right, mapFrom)) recomp();

    for (let row = top; row < bottom; row++) {
        const from = map.positionAt(row, left, table),
            to = map.positionAt(row, right, table);
        tr.replace(
            tr.mapping.slice(mapFrom).map(from + tableStart),
            tr.mapping.slice(mapFrom).map(to + tableStart),
            new Slice(cells.rows[row - top] as Fragment, 0, 0),
        );
    }
    recomp();
    tr.setSelection(
        new CellSelection(
            tr.doc.resolve(tableStart + map.positionAt(top, left, table)),
            tr.doc.resolve(tableStart + map.positionAt(bottom - 1, right - 1, table)),
        ),
    );
    dispatch(tr);
}
