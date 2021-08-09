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
        onCreate: commands(TurnIntoHeading)(1),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Medium Heading', 'looks_two'),
        onCreate: commands(TurnIntoHeading)(2),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Small Heading', 'looks_3'),
        onCreate: commands(TurnIntoHeading)(3),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        dom: createDropdownItem('Bullet List', 'format_list_bulleted'),
        onCreate: commands(WrapInBulletList)(),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        dom: createDropdownItem('Ordered List', 'format_list_numbered'),
        onCreate: commands(WrapInOrderedList)(),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        dom: createDropdownItem('Task List', 'checklist'),
        onCreate: commands(TurnIntoTaskList)(),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        dom: createDropdownItem('Image', 'image'),
        onCreate: commands(CreateImage)(),
        keyword: ['image'],
        enable: nodeExists('image'),
    },
    {
        dom: createDropdownItem('Quote', 'format_quote'),
        onCreate: commands(WrapInBlockquote)(),
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        dom: createDropdownItem('Table', 'table_chart'),
        onCreate: commands(CreateTable)(),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        dom: createDropdownItem('Code Fence', 'code'),
        onCreate: commands(TurnIntoCodeFence)(),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        dom: createDropdownItem('Divide Line', 'horizontal_rule'),
        onCreate: commands(CreateHr)(),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];
