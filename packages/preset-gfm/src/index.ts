import { SupportedKeys as TableKeys, tableNodes, tablePlugins } from '@milkdown/plugin-table';
import { commonmark, SupportedKeys as CommonmarkKeys } from '@milkdown/preset-commonmark';
import { AtomList } from '@milkdown/utils';
import { StrikeThrough } from './strike-through';
import { TaskListItem } from './task-list-item';

export const SupportedKeys = {
    ...CommonmarkKeys,
    ...TableKeys,
    StrikeThrough: 'StrikeThrough',
    TaskList: 'TaskList',
} as const;
export type SupportedKeys = typeof SupportedKeys;

export const gfmNodes = AtomList.create([...commonmark, ...tableNodes, new StrikeThrough(), new TaskListItem()]);
export const gfmPlugins = [...tablePlugins];
export const gfm = [...gfmNodes, ...gfmPlugins];

export * from './strike-through';
export * from './task-list-item';
