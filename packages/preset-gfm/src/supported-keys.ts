/* Copyright 2021, Milkdown by Mirone. */
import { SupportedKeys as TableKeys } from '@milkdown/plugin-table';
import { SupportedKeys as CommonmarkKeys } from '@milkdown/preset-commonmark';

export const SupportedKeys = {
    ...CommonmarkKeys,
    ...TableKeys,
    StrikeThrough: 'StrikeThrough',
    TaskList: 'TaskList',
} as const;
export type SupportedKeys = typeof SupportedKeys;
