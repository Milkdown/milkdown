/* Copyright 2021, Milkdown by Mirone. */

import {
    InsertHr,
    InsertImage,
    InsertTable,
    ToggleBold,
    ToggleItalic,
    ToggleLink,
    ToggleStrikeThrough,
    TurnIntoCodeFence,
    TurnIntoTaskList,
    WrapInBlockquote,
    WrapInBulletList,
    WrapInOrderedList,
} from '@milkdown/preset-gfm';

import { ButtonConfig } from './button';
import { SelectConfig } from './select';

type Config = Array<Array<SelectConfig | ButtonConfig>>;

export const defaultConfig: Config = [
    [
        {
            type: 'select',
            options: ['Large Heading', 'Medium Heading', 'Small Heading', 'Paragraph'],
        },
    ],
    [
        {
            type: 'button',
            icon: 'bold',
            key: ToggleBold,
        },
        {
            type: 'button',
            icon: 'italic',
            key: ToggleItalic,
        },
        {
            type: 'button',
            icon: 'strikeThrough',
            key: ToggleStrikeThrough,
        },
    ],
    [
        {
            type: 'button',
            icon: 'bulletList',
            key: WrapInBulletList,
        },
        {
            type: 'button',
            icon: 'orderedList',
            key: WrapInOrderedList,
        },
        {
            type: 'button',
            icon: 'taskList',
            key: TurnIntoTaskList,
        },
    ],
    [
        {
            type: 'button',
            icon: 'link',
            key: ToggleLink,
        },
        {
            type: 'button',
            icon: 'image',
            key: InsertImage,
        },
        {
            type: 'button',
            icon: 'table',
            key: InsertTable,
        },
        {
            type: 'button',
            icon: 'code',
            key: TurnIntoCodeFence,
        },
    ],
    [
        {
            type: 'button',
            icon: 'quote',
            key: WrapInBlockquote,
        },
        {
            type: 'button',
            icon: 'divider',
            key: InsertHr,
        },
    ],
];
