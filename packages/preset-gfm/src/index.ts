import { tableNodes, tablePlugins } from '@milkdown/plugin-table';
import { commands as commonmarkCommands, commonmarkNodes, commonmarkPlugins } from '@milkdown/preset-commonmark';
import { AtomList } from '@milkdown/utils';
import { urlPlugin } from './auto-link';
import { strikeThrough, ToggleStrikeThrough } from './strike-through';
import {
    LiftTaskListItem,
    SinkTaskListItem,
    SplitTaskListItem,
    taskListItem,
    TurnIntoTaskList,
} from './task-list-item';

export * from '@milkdown/plugin-table';
export * from '@milkdown/preset-commonmark';
export * from './strike-through';
export * from './task-list-item';
export { SupportedKeys } from './supported-keys';

export const gfmNodes = AtomList.create([...commonmarkNodes, ...tableNodes, strikeThrough(), taskListItem()]);
export const gfmPlugins = [...tablePlugins, ...commonmarkPlugins, urlPlugin];
export const gfm = [...gfmNodes, ...gfmPlugins];

export const commands = {
    ...commonmarkCommands,
    ToggleStrikeThrough,
    TurnIntoTaskList,
    SinkTaskListItem,
    LiftTaskListItem,
    SplitTaskListItem,
} as const;
export type Commands = typeof commands;
