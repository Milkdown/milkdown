import { SupportedKeys as TableKeys, tableNodes, tablePlugins } from '@milkdown/plugin-table';
import { SupportedKeys as CommonmarkKeys, commonmarkNodes, commonmarkPlugins } from '@milkdown/preset-commonmark';
import { AtomList } from '@milkdown/utils';
import { urlPlugin } from './auto-link';
import { strikeThrough } from './strike-through';
import { taskListItem } from './task-list-item';

export const SupportedKeys = {
    ...CommonmarkKeys,
    ...TableKeys,
    StrikeThrough: 'StrikeThrough',
    TaskList: 'TaskList',
} as const;
export type SupportedKeys = typeof SupportedKeys;

export const gfmNodes = AtomList.create([...commonmarkNodes, ...tableNodes, strikeThrough(), taskListItem()]);
export const gfmPlugins = [...tablePlugins, ...commonmarkPlugins, urlPlugin];
export const gfm = [...gfmNodes, ...gfmPlugins];

export * from './strike-through';
export * from './task-list-item';
