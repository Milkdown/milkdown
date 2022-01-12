/* Copyright 2021, Milkdown by Mirone. */
import { BreakTable, InsertTable, NextCell, PrevCell } from './nodes';

export { BreakTable, InsertTable, NextCell, PrevCell, SupportedKeys, table } from './nodes';
export { createTable } from './utils';

export const commands = {
    NextCell,
    PrevCell,
    BreakTable,
    InsertTable,
} as const;
export type Commands = typeof commands;
