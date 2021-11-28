/* Copyright 2021, Milkdown by Mirone. */

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
        },
        {
            type: 'button',
            icon: 'italic',
        },
        {
            type: 'button',
            icon: 'strikeThrough',
        },
    ],
    [
        {
            type: 'button',
            icon: 'bulletList',
        },
        {
            type: 'button',
            icon: 'orderedList',
        },
        {
            type: 'button',
            icon: 'taskList',
        },
    ],
    [
        {
            type: 'button',
            icon: 'link',
        },
        {
            type: 'button',
            icon: 'image',
        },
        {
            type: 'button',
            icon: 'table',
        },
        {
            type: 'button',
            icon: 'code',
        },
    ],
    [
        {
            type: 'button',
            icon: 'quote',
        },
        {
            type: 'button',
            icon: 'divider',
        },
    ],
];
