/* Copyright 2021, Milkdown by Mirone. */

import { Ctx, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import { Decoration } from '@milkdown/prose/view';

import { CellPos, selectLine, selectTable } from '../utils';
import { ToolTipPos } from './constant';

const calculateClassName = (pos: ToolTipPos) => {
    switch (pos) {
        case ToolTipPos.Left: {
            return 'milkdown-cell-left';
        }
        case ToolTipPos.Top: {
            return 'milkdown-cell-top';
        }
        case ToolTipPos.Point:
        default: {
            return 'milkdown-cell-point';
        }
    }
};

export function createWidget(ctx: Ctx, cell: CellPos, pos: ToolTipPos.Point): Decoration;
export function createWidget(ctx: Ctx, cell: CellPos, pos: ToolTipPos.Left, index: number): Decoration;
export function createWidget(ctx: Ctx, cell: CellPos, pos: ToolTipPos.Top, index: number): Decoration;
export function createWidget(ctx: Ctx, cell: CellPos, pos: ToolTipPos, index = 0) {
    return Decoration.widget(cell.pos + 1, (view) => {
        const div = document.createElement('div');
        div.classList.add(calculateClassName(pos));
        if (pos === ToolTipPos.Point) {
            div.appendChild(ctx.get(themeManagerCtx).get(ThemeIcon, 'select')?.dom as HTMLElement);
        }
        div.addEventListener('mousedown', (e) => {
            if (!view) return;

            e.preventDefault();
            switch (pos) {
                case ToolTipPos.Point: {
                    view.dispatch(selectTable(view.state.tr));
                    return;
                }
                case ToolTipPos.Left: {
                    view.dispatch(selectLine('row')(index)(view.state.tr));
                    return;
                }
                case ToolTipPos.Top: {
                    view.dispatch(selectLine('col')(index)(view.state.tr));
                    return;
                }
            }
        });
        return div;
    });
}
