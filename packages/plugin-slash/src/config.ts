/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, themeToolCtx } from '@milkdown/core';
import {
    InsertHr,
    InsertImage,
    InsertTable,
    TurnIntoCodeFence,
    TurnIntoHeading,
    TurnIntoTaskList,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
} from '@milkdown/preset-gfm';

import type { SlashConfig } from '.';
import { createDropdownItem, nodeExists } from './utility';

export const config: SlashConfig = ({ ctx }) => [
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Large Heading', 'looks_one'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 1),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Medium Heading', 'looks_two'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 2),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Small Heading', 'looks_3'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 3),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Bullet List', 'format_list_bulleted'),
        command: () => ctx.get(commandsCtx).call(WrapInBulletList),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Ordered List', 'format_list_numbered'),
        command: () => ctx.get(commandsCtx).call(WrapInOrderedList),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Task List', 'checklist'),
        command: () => ctx.get(commandsCtx).call(TurnIntoTaskList),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Image', 'image'),
        command: () => ctx.get(commandsCtx).call(InsertImage),
        keyword: ['image'],
        enable: nodeExists('image'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Quote', 'format_quote'),
        command: () => ctx.get(commandsCtx).call(WrapInBlockquote),
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Table', 'table_chart'),
        command: () => ctx.get(commandsCtx).call(InsertTable),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Code Fence', 'code'),
        command: () => ctx.get(commandsCtx).call(TurnIntoCodeFence),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        dom: createDropdownItem(ctx.get(themeToolCtx), 'Divide Line', 'horizontal_rule'),
        command: () => ctx.get(commandsCtx).call(InsertHr),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];
