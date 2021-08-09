import {
    CreateHr,
    CreateImage,
    TurnIntoCodeFence,
    TurnIntoHeading,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
} from '@milkdown/preset-commonmark';
import { TurnIntoTaskList } from '@milkdown/preset-gfm';
import { CreateTable } from '@milkdown/plugin-table';
import { SlashConfig } from '.';
import { createDropdownItem, nodeExists } from './utility';

export const config: SlashConfig = (commands) => [
    {
        dom: createDropdownItem('Large Heading', 'looks_one'),
        command: commands(TurnIntoHeading)(1),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Medium Heading', 'looks_two'),
        command: commands(TurnIntoHeading)(2),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Small Heading', 'looks_3'),
        command: commands(TurnIntoHeading)(3),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Bullet List', 'format_list_bulleted'),
        command: commands(WrapInBulletList)(),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        dom: createDropdownItem('Ordered List', 'format_list_numbered'),
        command: commands(WrapInOrderedList)(),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        dom: createDropdownItem('Task List', 'checklist'),
        command: commands(TurnIntoTaskList)(),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        dom: createDropdownItem('Image', 'image'),
        command: commands(CreateImage)(),
        keyword: ['image'],
        enable: nodeExists('image'),
    },
    {
        dom: createDropdownItem('Quote', 'format_quote'),
        command: commands(WrapInBlockquote)(),
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        dom: createDropdownItem('Table', 'table_chart'),
        command: commands(CreateTable)(),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        dom: createDropdownItem('Code Fence', 'code'),
        command: commands(TurnIntoCodeFence)(),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        dom: createDropdownItem('Divide Line', 'horizontal_rule'),
        command: commands(CreateHr)(),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];
