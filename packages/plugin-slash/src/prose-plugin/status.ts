/* Copyright 2021, Milkdown by Mirone. */
import { Action } from '../item';

export enum CursorStatus {
    Empty = 'empty',
    Slash = 'slash',
}

export type StatusCtx = {
    cursorStatus: CursorStatus;
    actions: Action[];
};

const createStatusCtx = (): StatusCtx => {
    return {
        cursorStatus: CursorStatus.Empty,
        actions: [],
    };
};

const clearStatus = (status: StatusCtx) => {
    status.actions = [];
    status.cursorStatus = CursorStatus.Empty;
};

export type Status = ReturnType<typeof createStatus>;

export const createStatus = () => {
    const statusCtx = createStatusCtx();

    return {
        clearStatus: () => clearStatus(statusCtx),
        setActions: (actions: Action[]) => {
            statusCtx.cursorStatus = CursorStatus.Slash;
            statusCtx.actions = actions;
        },
        get: () => statusCtx,
        isEmpty: () => statusCtx.cursorStatus === CursorStatus.Empty,
        isSlash: () => statusCtx.cursorStatus === CursorStatus.Slash,
    };
};
