/* Copyright 2021, Milkdown by Mirone. */
import { SupportedKeys as CommonmarkKeys } from '@milkdown/preset-commonmark';

import { SupportedKeys as TableKeys } from './table';

export const SupportedKeys = {
    ...CommonmarkKeys,
    ...TableKeys,
    StrikeThrough: 'StrikeThrough',
    TaskList: 'TaskList',
} as const;
export type SupportedKeys = typeof SupportedKeys;
