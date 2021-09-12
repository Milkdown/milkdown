/* Copyright 2021, Milkdown by Mirone. */
import { Action } from '../item';

export enum CursorStatus {
    Empty = 'empty',
    Slash = 'slash',
}

export type StatusCtx = {
    cursorStatus: CursorStatus;
    filter: string;
    activeActions: Action[];
};

const createStatusCtx = (): StatusCtx => {
    return {
        cursorStatus: CursorStatus.Empty,
        filter: '',
        activeActions: [],
    };
};

const clearStatus = (status: StatusCtx) => {
    status.cursorStatus = CursorStatus.Empty;
    status.filter = '';
};

const setSlash = (status: StatusCtx, filter = '') => {
    status.cursorStatus = CursorStatus.Slash;
    status.filter = filter;
};

export type Status = ReturnType<typeof createStatus>;

export const createStatus = () => {
    const statusCtx = createStatusCtx();
    return {
        clearStatus: () => clearStatus(statusCtx),
        setSlash: (filter = '') => setSlash(statusCtx, filter),
        setActions: (actions: Action[]) => {
            statusCtx.activeActions = actions;
        },
        get: () => statusCtx,
        isEmpty: () => statusCtx.cursorStatus === CursorStatus.Empty,
        isSlash: () => statusCtx.cursorStatus === CursorStatus.Slash,
    };
};
