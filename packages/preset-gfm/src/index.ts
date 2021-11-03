/* Copyright 2021, Milkdown by Mirone. */
import { tablePlugin } from '@milkdown/plugin-table';
import { commands as commonmarkCommands, commonmark } from '@milkdown/preset-commonmark';
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

export * from './strike-through';
export { SupportedKeys } from './supported-keys';
export * from './task-list-item';
export {
    BreakTable,
    // command
    createTable,
    InsertTable,
    NextCell,
    PrevCell,
    // gather
    table,
    tablePlugin,
} from '@milkdown/plugin-table';
export {
    blockquote,
    bulletList,
    codeFence,
    codeInline,
    commonmark,
    // gather
    commonmarkNodes,
    commonmarkPlugins,
    // node
    doc,
    em,
    hardbreak,
    heading,
    hr,
    image,
    // command
    InsertHardbreak,
    InsertHr,
    InsertImage,
    LiftListItem,
    link,
    listItem,
    ModifyImage,
    ModifyLink,
    orderedList,
    paragraph,
    SinkListItem,
    SplitListItem,
    strong,
    text,
    ToggleBold,
    ToggleInlineCode,
    ToggleItalic,
    ToggleLink,
    TurnIntoCodeFence,
    TurnIntoHeading,
    TurnIntoText,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
} from '@milkdown/preset-commonmark';

export const gfm = AtomList.create([...commonmark, tablePlugin(), urlPlugin(), strikeThrough(), taskListItem()]);

export const commands = {
    ...commonmarkCommands,
    ToggleStrikeThrough,
    TurnIntoTaskList,
    SinkTaskListItem,
    LiftTaskListItem,
    SplitTaskListItem,
} as const;
export type Commands = typeof commands;
