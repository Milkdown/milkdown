/* Copyright 2021, Milkdown by Mirone. */
import type { StatusConfig } from '..';
import { Action } from '../item';

export enum CursorStatus {
    Empty = 'empty',
    Slash = 'slash',
    Hash = 'hash',
}

export type StatusCtx = {
    configuration: StatusConfig;
    cursorStatus: CursorStatus;
    filter: string;
    actions: Action[];
};

const createStatusCtx = (configuration: StatusConfig): StatusCtx => {
    return {
        configuration,
        cursorStatus: CursorStatus.Empty,
        filter: '',
        actions: [],
    };
};

const clearStatus = (status: StatusCtx) => {
    status.actions = [];
    status.cursorStatus = CursorStatus.Empty;
    status.filter = '';
};

export type Status = ReturnType<typeof createStatus>;

export const createStatus = (configurations: StatusConfig[]) => {
    const statusCtx = createStatusCtx(configurations[0]);
    return {
        configurations,
        clearStatus: () => clearStatus(statusCtx),
        setActions: (actions: Action[]) => {
            statusCtx.actions = actions;
        },
        get: () => statusCtx,
        isEmpty: () => statusCtx.cursorStatus === CursorStatus.Empty,
        isSlash: () => statusCtx.cursorStatus === CursorStatus.Slash,
    };
};
