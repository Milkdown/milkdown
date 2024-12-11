import type { ContentNodeWithPos } from '@milkdown/prose';
import type { Node, ResolvedPos } from '@milkdown/prose/model';
import type { Selection, Transaction } from '@milkdown/prose/state';
import type { TableRect } from '@milkdown/prose/tables';
import type { Ctx } from '@milkdown/ctx';
export interface CellPos {
    pos: number;
    start: number;
    node: Node;
}
export declare function createTable(ctx: Ctx, rowsCount?: number, colsCount?: number): Node;
export declare function findTable($pos: ResolvedPos): ContentNodeWithPos | undefined;
export declare function getCellsInCol(columnIndex: number, selection: Selection): CellPos[] | undefined;
export declare function getCellsInRow(rowIndex: number, selection: Selection): CellPos[] | undefined;
export declare function getAllCellsInTable(selection: Selection): {
    pos: number;
    start: number;
    node: Node | null;
}[] | undefined;
export declare function selectTable(tr: Transaction): Transaction;
export declare function addRowWithAlignment(ctx: Ctx, tr: Transaction, { map, tableStart, table }: TableRect, row: number): Transaction;
export declare function selectLine(type: 'row' | 'col'): (index: number, pos?: number) => (tr: Transaction) => Transaction;
export declare const selectRow: (index: number, pos?: number) => (tr: Transaction) => Transaction;
export declare const selectCol: (index: number, pos?: number) => (tr: Transaction) => Transaction;
export interface MoveColParams {
    tr: Transaction;
    origin: number;
    target: number;
    select?: boolean;
    pos?: number;
}
export declare function moveCol(moveColParams: MoveColParams): Transaction;
export interface MoveRowParams {
    tr: Transaction;
    origin: number;
    target: number;
    select?: boolean;
    pos?: number;
}
export declare function moveRow(moveRowParams: MoveRowParams): Transaction;
//# sourceMappingURL=utils.d.ts.map