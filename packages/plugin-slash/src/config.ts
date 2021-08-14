import {
    InsertHr,
    InsertImage,
    TurnIntoCodeFence,
    TurnIntoHeading,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
    TurnIntoTaskList,
    InsertTable,
} from '@milkdown/preset-gfm';
import type { SlashConfig } from '.';
import { createDropdownItem, nodeExists } from './utility';
import { commandsCtx } from '@milkdown/core';

export const config: SlashConfig = (ctx) => [
    {
        dom: createDropdownItem('Large Heading', 'looks_one'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 1),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Medium Heading', 'looks_two'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 2),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Small Heading', 'looks_3'),
        command: () => ctx.get(commandsCtx).call(TurnIntoHeading, 3),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Bullet List', 'format_list_bulleted'),
        command: () => ctx.get(commandsCtx).call(WrapInBulletList),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        dom: createDropdownItem('Ordered List', 'format_list_numbered'),
        command: () => ctx.get(commandsCtx).call(WrapInOrderedList),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        dom: createDropdownItem('Task List', 'checklist'),
        command: () => ctx.get(commandsCtx).call(TurnIntoTaskList),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        dom: createDropdownItem('Image', 'image'),
        command: () => ctx.get(commandsCtx).call(InsertImage),
        keyword: ['image'],
        enable: nodeExists('image'),
    },
    {
        dom: createDropdownItem('Quote', 'format_quote'),
        command: () => ctx.get(commandsCtx).call(WrapInBlockquote),
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        dom: createDropdownItem('Table', 'table_chart'),
        command: () => ctx.get(commandsCtx).call(InsertTable),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        dom: createDropdownItem('Code Fence', 'code'),
        command: () => ctx.get(commandsCtx).call(TurnIntoCodeFence),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        dom: createDropdownItem('Divide Line', 'horizontal_rule'),
        command: () => ctx.get(commandsCtx).call(InsertHr),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];
