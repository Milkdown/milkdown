/* Copyright 2021, Milkdown by Mirone. */
import { Command } from 'prosemirror-commands';
import {
    addColumnAfter,
    addColumnBefore,
    deleteColumn,
    deleteRow,
    deleteTable,
    isInTable,
    selectedRect,
    setCellAttr,
} from 'prosemirror-tables';
import { EditorView } from 'prosemirror-view';

import { addRowWithAlignment } from '../utils';
import { getCellSelection, icon, isFirstRowSelected } from './helper';

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

export const createActions: () => Record<Action, Item> = () => ({
    [Action.AddColLeft]: {
        $: icon('chevron_left'),
        command: () => addColumnBefore,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddColRight]: {
        $: icon('chevron_right'),
        command: () => addColumnAfter,
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AddRowTop]: {
        $: icon('expand_less'),
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
        $: icon('expand_more'),
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
        $: icon('format_align_left'),
        command: () => setCellAttr('alignment', 'left'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignCenter]: {
        $: icon('format_align_center'),
        command: () => setCellAttr('alignment', 'center'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.AlignRight]: {
        $: icon('format_align_right'),
        command: () => setCellAttr('alignment', 'right'),
        disable: (view) => !getCellSelection(view).isColSelection(),
    },
    [Action.Delete]: {
        $: icon('delete'),
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
