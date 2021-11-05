/* Copyright 2021, Milkdown by Mirone. */
import { Action, transformAction, WrappedAction } from '../item';

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

export type Status = ReturnType<typeof createStatus>;

export const createStatus = () => {
    const statusCtx = createStatusCtx();

    return {
        get: () => statusCtx,
        clear: () => {
            statusCtx.cursorStatus = CursorStatus.Empty;
            statusCtx.actions = [];
        },
        setActions: (actions: WrappedAction[]) => {
            statusCtx.cursorStatus = CursorStatus.Slash;
            statusCtx.actions = actions.map(transformAction);
        },
        isEmpty: () => statusCtx.cursorStatus === CursorStatus.Empty,
        isSlash: () => statusCtx.cursorStatus === CursorStatus.Slash,
    };
};
