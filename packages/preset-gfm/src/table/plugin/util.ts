/* Copyright 2021, Milkdown by Mirone. */
import { Attrs, Node, ResolvedPos } from '@milkdown/prose/model';
import { EditorState, NodeSelection } from '@milkdown/prose/state';

import { CellSelection } from './cell-selection';
import { tableNodeTypes } from './schema';
import { TableMap } from './table-map';

export function cellAround($pos: ResolvedPos) {
    for (let d = $pos.depth - 1; d > 0; d--)
        if ($pos.node(d).type.spec['tableRole'] == 'row') return $pos.node(0).resolve($pos.before(d + 1));
    return undefined;
}

export function cellWrapping($pos: ResolvedPos) {
    for (let d = $pos.depth; d > 0; d--) {
        // Sometimes the cell can be in the same depth.
        const role = $pos.node(d).type.spec['tableRole'];
        if (role === 'cell' || role === 'header_cell') return $pos.node(d);
    }
    return null;
}

export function pointsAtCell($pos: ResolvedPos): Node | null {
    if ($pos.parent.type.spec['tableRole'] == 'row') return $pos.nodeAfter;
    return null;
}

export function moveCellForward($pos: ResolvedPos) {
    return $pos.node(0).resolve($pos.pos + ($pos.nodeAfter as Node).nodeSize);
}

export function inSameTable($a: ResolvedPos, $b: ResolvedPos) {
    return $a.depth == $b.depth && $a.pos >= $b.start(-1) && $a.pos <= $b.end(-1);
}

export function nextCell($pos: ResolvedPos, axis: string, dir: number) {
    const start = $pos.start(-1),
        map = TableMap.get($pos.node(-1));
    const moved = map.nextCell($pos.pos - start, axis, dir);
    return moved == null ? null : $pos.node(0).resolve(start + moved);
}

export function setAttr<T>(attrs: Attrs, name: string, value: T) {
    const result: Record<string, unknown> = {};
    for (const prop in attrs) result[prop] = attrs[prop];
    result[name] = value;
    return result as Attrs;
}

export function removeColSpan(attrs: Attrs, pos: number, n = 1) {
    const result = setAttr(attrs, 'colspan', attrs['colspan'] - n) as Record<string, unknown>;
    if (result['colwidth']) {
        const widths = result['colwidth'] as number[];
        result['colwidth'] = widths.slice();
        widths.splice(pos, n);
        if (!widths.some((w) => w > 0)) result['colwidth'] = null;
    }
    return result;
}

export function isInTable(state: EditorState) {
    const $head = state.selection.$head;
    for (let d = $head.depth; d > 0; d--) if ($head.node(d).type.spec['tableRole'] == 'row') return true;
    return false;
}

export function selectionCell(state: EditorState) {
    const sel = state.selection;
    if (sel instanceof CellSelection) {
        return sel.$anchorCell.pos > sel.$headCell.pos ? sel.$anchorCell : sel.$headCell;
    } else if ((sel as NodeSelection).node && (sel as NodeSelection).node.type.spec['tableRole'] == 'cell') {
        return sel.$anchor;
    }
    return cellAround(sel.$head) || cellNear(sel.$head);
}

function cellNear($pos: ResolvedPos) {
    for (let after = $pos.nodeAfter, pos = $pos.pos; after; after = after.firstChild, pos++) {
        const role = after.type.spec['tableRole'];
        if (role == 'cell' || role == 'header_cell') return $pos.doc.resolve(pos);
    }
    for (let before = $pos.nodeBefore, pos = $pos.pos; before; before = before.lastChild, pos--) {
        const role = before.type.spec['tableRole'];
        if (role == 'cell' || role == 'header_cell') return $pos.doc.resolve(pos - before.nodeSize);
    }
    return;
}

export function addColSpan(attrs: Attrs, pos: number, n = 1) {
    const result = setAttr(attrs, 'colspan', attrs['colspan'] + n) as Record<string, unknown>;
    if (result['colwidth']) {
        const widths = result['colwidth'] as number[];
        result['colwidth'] = widths.slice();
        for (let i = 0; i < n; i++) widths.splice(pos, 0, 0);
    }
    return result as Attrs;
}

export function columnIsHeader(map: TableMap, table: Node, col: number) {
    const headerCell = tableNodeTypes(table.type.schema).header_cell;
    for (let row = 0; row < map.height; row++) {
        const pos = map.map[col + row * map.width] as number;
        if ((table.nodeAt(pos) as Node).type != headerCell) return false;
    }
    return true;
}
