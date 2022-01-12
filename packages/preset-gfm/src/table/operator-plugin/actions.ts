/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, themeToolCtx } from '@milkdown/core';
import {
    addColumnAfter,
    addColumnBefore,
    Command,
    deleteColumn,
    deleteRow,
    deleteTable,
    EditorView,
    isInTable,
    selectedRect,
    setCellAttr,
} from '@milkdown/prose';

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
        $: ctx.get(themeToolCtx).slots.icon('leftArrow'),
        command: () => addColumnBefore,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddColRight]: {
        $: ctx.get(themeToolCtx).slots.icon('rightArrow'),
        command: () => addColumnAfter,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddRowTop]: {
        $: ctx.get(themeToolCtx).slots.icon('upArrow'),
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
        $: ctx.get(themeToolCtx).slots.icon('downArrow'),
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
        $: ctx.get(themeToolCtx).slots.icon('alignLeft'),
        command: () => setCellAttr('alignment', 'left'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignCenter]: {
        $: ctx.get(themeToolCtx).slots.icon('alignCenter'),
        command: () => setCellAttr('alignment', 'center'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignRight]: {
        $: ctx.get(themeToolCtx).slots.icon('alignRight'),
        command: () => setCellAttr('alignment', 'right'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.Delete]: {
        $: ctx.get(themeToolCtx).slots.icon('delete'),
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
