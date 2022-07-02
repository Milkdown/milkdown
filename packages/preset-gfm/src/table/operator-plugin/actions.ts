/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, ThemeIcon, themeManagerCtx } from '@milkdown/core';
import { Command } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';

import {
    addColumnAfter,
    addColumnBefore,
    deleteColumn,
    deleteRow,
    deleteTable,
    isInTable,
    selectedRect,
    setCellAttr,
} from '../plugin';
import { addRowWithAlignment } from '../utils';
import { getCellSelection, isFirstRowSelected } from './helper';

export type Item = {
    $: HTMLElement;
    command: (e: Event, view: EditorView) => Command;
    disable?: (view: EditorView) => boolean;
};

export enum Action {
    AddColLeft,
    AddColRight,
    AddRowTop,
    AddRowBottom,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Delete,
}

export const createActions: (ctx: Ctx) => Record<Action, Item> = (ctx) => ({
    [Action.AddColLeft]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'leftArrow')?.dom as HTMLElement,
        command: () => addColumnBefore,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddColRight]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'rightArrow')?.dom as HTMLElement,
        command: () => addColumnAfter,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddRowTop]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'upArrow')?.dom as HTMLElement,
        command: () => (state, dispatch) => {
            if (!isInTable(state)) return false;
            if (dispatch) {
                const rect = selectedRect(state);
                dispatch(addRowWithAlignment(state.tr, rect, rect.top));
            }
            return true;
        },
        disable: (view) =>
            !getCellSelection(view).isRowSelection() ||
            getCellSelection(view).$head.parent.type.name === 'table_header',
    },
    [Action.AddRowBottom]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'downArrow')?.dom as HTMLElement,
        command: () => (state, dispatch) => {
            if (!isInTable(state)) return false;
            if (dispatch) {
                const rect = selectedRect(state);
                dispatch(addRowWithAlignment(state.tr, rect, rect.bottom));
            }
            return true;
        },
        disable: (view) => !getCellSelection(view).isRowSelection(),
    },
    [Action.AlignLeft]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'alignLeft')?.dom as HTMLElement,
        command: () => setCellAttr('alignment', 'left'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignCenter]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'alignCenter')?.dom as HTMLElement,
        command: () => setCellAttr('alignment', 'center'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignRight]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'alignRight')?.dom as HTMLElement,
        command: () => setCellAttr('alignment', 'right'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.Delete]: {
        $: ctx.get(themeManagerCtx).get(ThemeIcon, 'delete')?.dom as HTMLElement,
        command: (_, view) => {
            const selection = getCellSelection(view);
            const isCol = selection.isColSelection();
            const isRow = selection.isRowSelection();
            if (isCol && isRow) {
                return deleteTable;
            }

            if (isCol) {
                return deleteColumn;
            }

            return deleteRow;
        },
        disable: (view) => {
            const selection = getCellSelection(view);
            if (selection.isRowSelection()) {
                if (selection.isColSelection()) {
                    return false;
                }
                return isFirstRowSelected(selection);
            }
            return false;
        },
    },
});
