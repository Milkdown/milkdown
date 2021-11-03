/* Copyright 2021, Milkdown by Mirone. */
import { AtomList } from '@milkdown/utils';

import { BreakTable, InsertTable, NextCell, PrevCell, tablePlugin } from './nodes';

export const table = AtomList.create([tablePlugin()]);

export { BreakTable, InsertTable, NextCell, PrevCell, SupportedKeys, tablePlugin } from './nodes';
export { createTable } from './utils';

export const commands = {
    NextCell,
    PrevCell,
    BreakTable,
    InsertTable,
} as const;
export type Commands = typeof commands;
