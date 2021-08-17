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

export {
    // gather
    table,
    tablePlugins,
    tableNodes,
    // command
    createTable,
    BreakTable,
    NextCell,
    PrevCell,
    InsertTable,
} from '@milkdown/plugin-table';
export {
    // command
    InsertHardbreak,
    InsertHr,
    InsertImage,
    LiftListItem,
    ModifyImage,
    SinkListItem,
    SplitListItem,
    TurnIntoCodeFence,
    TurnIntoHeading,
    TurnIntoText,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
    ModifyLink,
    ToggleBold,
    ToggleInlineCode,
    ToggleItalic,
    ToggleLink,
    // gather
    commonmarkNodes,
    commonmarkPlugins,
    commonmark,
    // node
    doc,
    paragraph,
    hardbreak,
    blockquote,
    codeFence,
    bulletList,
    orderedList,
    listItem,
    heading,
    hr,
    image,
    text,
    codeInline,
    em,
    strong,
    link,
} from '@milkdown/preset-commonmark';

export * from './strike-through';
export * from './task-list-item';
export { SupportedKeys } from './supported-keys';

export const gfmNodes = AtomList.create([...tableNodes, strikeThrough(), taskListItem(), ...commonmarkNodes]);
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
