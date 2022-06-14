/* Copyright 2021, Milkdown by Mirone. */

import { Attrs, Node } from '@milkdown/prose/model';

const cache = new WeakMap<Node, TableMap>();
const readFromCache = (key: Node) => cache.get(key);
const addToCache = (key: Node, value: TableMap) => {
    cache.set(key, value);
    return value;
};

export class Rect {
    public tableStart?: number;
    public map?: TableMap;
    public table?: Node;
    constructor(public left: number, public top: number, public right: number, public bottom: number) {}
}

// ::- A table map describes the structore of a given table. To avoid
// recomputing them all the time, they are cached per table node. To
// be able to do that, positions saved in the map are relative to the
// start of the table, rather than the start of the document.
export class TableMap {
    constructor(public width: number, public height: number, public map: number[], public problems?: Problem[]) {
        // :: number The width of the table
        this.width = width;
        // :: number The table's height
        this.height = height;
        // :: [number] A width * height array with the start position of
        // the cell covering that part of the table in each slot
        this.map = map;
        // An optional array of problems (cell overlap or non-rectangular
        // shape) for the table, used by the table normalizer.
        this.problems = problems;
    }

    // Find the dimensions of the cell at the given position.
    findCell(pos: number): Rect {
        for (let i = 0; i < this.map.length; i++) {
            const curPos = this.map[i];
            if (curPos != pos) continue;
            const left = i % this.width,
                top = (i / this.width) | 0;
            let right = left + 1,
                bottom = top + 1;
            for (let j = 1; right < this.width && this.map[i + j] == curPos; j++) right++;
            for (let j = 1; bottom < this.height && this.map[i + this.width * j] == curPos; j++) bottom++;
            return new Rect(left, top, right, bottom);
        }
        throw new RangeError('No cell with offset ' + pos + ' found');
    }

    colCount(pos: number): number {
        for (let i = 0; i < this.map.length; i++) if (this.map[i] == pos) return i % this.width;
        throw new RangeError('No cell with offset ' + pos + ' found');
    }

    // :: (number, string, number) → ?number
    // Find the next cell in the given direction, starting from the cell
    // at `pos`, if any.
    nextCell(pos: number, axis: string, dir: number): number | undefined {
        const { left, right, top, bottom } = this.findCell(pos);
        if (axis == 'horiz') {
            if (dir < 0 ? left == 0 : right == this.width) return undefined;
            return this.map[top * this.width + (dir < 0 ? left - 1 : right)];
        } else {
            if (dir < 0 ? top == 0 : bottom == this.height) return undefined;
            return this.map[left + this.width * (dir < 0 ? top - 1 : bottom)];
        }
    }

    // :: (number, number) → Rect
    // Get the rectangle spanning the two given cells.
    rectBetween(a: number, b: number): Rect {
        const { left: leftA, right: rightA, top: topA, bottom: bottomA } = this.findCell(a);
        const { left: leftB, right: rightB, top: topB, bottom: bottomB } = this.findCell(b);
        return new Rect(
            Math.min(leftA, leftB),
            Math.min(topA, topB),
            Math.max(rightA, rightB),
            Math.max(bottomA, bottomB),
        );
    }

    // :: (Rect) → [number]
    // Return the position of all cells that have the top left corner in
    // the given rectangle.
    cellsInRect(rect: Rect): number[] {
        const result: number[] = [],
            seen: Record<number, boolean> = {};
        for (let row = rect.top; row < rect.bottom; row++) {
            for (let col = rect.left; col < rect.right; col++) {
                const index = row * this.width + col,
                    pos = this.map[index] as number;
                if (seen[pos]) continue;
                seen[pos] = true;
                if (
                    (col != rect.left || !col || this.map[index - 1] != pos) &&
                    (row != rect.top || !row || this.map[index - this.width] != pos)
                )
                    result.push(pos);
            }
        }
        return result;
    }

    // :: (number, number, Node) → number
    // Return the position at which the cell at the given row and column
    // starts, or would start, if a cell started there.
    positionAt(row: number, col: number, table: Node): number {
        for (let i = 0, rowStart = 0; ; i++) {
            const rowEnd = rowStart + table.child(i).nodeSize;
            if (i == row) {
                let index = col + row * this.width;
                const rowEndIndex = (row + 1) * this.width;
                // Skip past cells from previous rows (via rowspan)
                while (index < rowEndIndex && (this.map[index] as number) < rowStart) index++;
                return index == rowEndIndex ? rowEnd - 1 : (this.map[index] as number);
            }
            rowStart = rowEnd;
        }
    }

    // Find the table map for the given table node.
    static get(table: Node): TableMap {
        return readFromCache(table) || addToCache(table, computeMap(table));
    }
}

export type Problem =
    | {
          type: 'missing';
          row: number;
          n: number;
      }
    | {
          type: 'overlong_rowspan';
          pos: number;
          n: number;
      }
    | {
          type: 'collision';
          row: number;
          pos: number;
          n: number;
      }
    | {
          type: 'colwidth mismatch';
          pos: number;
          colwidth: boolean;
      };

// Compute a table map.
function computeMap(table: Node) {
    if (table.type.spec['tableRole'] != 'table') throw new RangeError('Not a table node: ' + table.type.name);
    const width = findWidth(table),
        height = table.childCount;
    const map: number[] = [];
    const colWidths: number[] = [];
    let mapPos = 0,
        problems: Problem[] | undefined = undefined;
    for (let i = 0, e = width * height; i < e; i++) map[i] = 0;

    for (let row = 0, pos = 0; row < height; row++) {
        const rowNode = table.child(row);
        pos++;
        for (let i = 0; ; i++) {
            while (mapPos < map.length && map[mapPos] != 0) mapPos++;
            if (i == rowNode.childCount) break;
            const cellNode = rowNode.child(i),
                { colspan, rowspan, colwidth } = cellNode.attrs;
            for (let h = 0; h < rowspan; h++) {
                if (h + row >= height) {
                    (problems || (problems = [])).push({
                        type: 'overlong_rowspan',
                        pos,
                        n: rowspan - h,
                    });
                    break;
                }
                const start = mapPos + h * width;
                for (let w = 0; w < colspan; w++) {
                    if (map[start + w] == 0) map[start + w] = pos;
                    else
                        (problems || (problems = [])).push({
                            type: 'collision',
                            row,
                            pos,
                            n: colspan - w,
                        });
                    const colW = colwidth && colwidth[w];
                    if (colW) {
                        const widthIndex = ((start + w) % width) * 2,
                            prev = colWidths[widthIndex];
                        if (prev == null || (prev != colW && colWidths[widthIndex + 1] == 1)) {
                            colWidths[widthIndex] = colW;
                            colWidths[widthIndex + 1] = 1;
                        } else if (prev == colW) {
                            colWidths[widthIndex + 1]++;
                        }
                    }
                }
            }
            mapPos += colspan;
            pos += cellNode.nodeSize;
        }
        const expectedPos = (row + 1) * width;
        let missing = 0;
        while (mapPos < expectedPos) if (map[mapPos++] == 0) missing++;
        if (missing) (problems || (problems = [])).push({ type: 'missing', row, n: missing });
        pos++;
    }

    const tableMap = new TableMap(width, height, map, problems);
    let badWidths = false;

    // For columns that have defined widths, but whose widths disagree
    // between rows, fix up the cells whose width doesn't match the
    // computed one.
    for (let i = 0; !badWidths && i < colWidths.length; i += 2)
        if (colWidths[i] != null && (colWidths[i + 1] as number) < height) badWidths = true;
    if (badWidths) findBadColWidths(tableMap, colWidths, table);

    return tableMap;
}

function findWidth(table: Node) {
    let width = -1,
        hasRowSpan = false;
    for (let row = 0; row < table.childCount; row++) {
        const rowNode = table.child(row);
        let rowWidth = 0;
        if (hasRowSpan)
            for (let j = 0; j < row; j++) {
                const prevRow = table.child(j);
                for (let i = 0; i < prevRow.childCount; i++) {
                    const cell = prevRow.child(i);
                    if (j + cell.attrs['rowspan'] > row) rowWidth += cell.attrs['colspan'];
                }
            }
        for (let i = 0; i < rowNode.childCount; i++) {
            const cell = rowNode.child(i);
            rowWidth += cell.attrs['colspan'];
            if (cell.attrs['rowspan'] > 1) hasRowSpan = true;
        }
        if (width == -1) width = rowWidth;
        else if (width != rowWidth) width = Math.max(width, rowWidth);
    }
    return width;
}

function findBadColWidths(map: TableMap, colWidths: number[], table: Node) {
    if (!map.problems) map.problems = [];
    for (let i = 0, seen: Record<number, boolean> = {}; i < map.map.length; i++) {
        const pos = map.map[i] as number;
        if (seen[pos]) continue;
        seen[pos] = true;
        const node = table.nodeAt(pos) as Node;
        let updated = null;
        for (let j = 0; j < node.attrs['colspan']; j++) {
            const col = (i + j) % map.width,
                colWidth = colWidths[col * 2];
            if (colWidth != null && (!node.attrs['colwidth'] || node.attrs['colwidth'][j] != colWidth))
                (updated || (updated = freshColWidth(node.attrs)))[j] = colWidth;
        }
        if (updated)
            map.problems.unshift({
                type: 'colwidth mismatch',
                pos,
                colwidth: updated,
            });
    }
}

function freshColWidth(attrs: Attrs) {
    if (attrs['colwidth']) return attrs['colwidth'].slice();
    const result = [];
    for (let i = 0; i < attrs['colspan']; i++) result.push(0);
    return result;
}
