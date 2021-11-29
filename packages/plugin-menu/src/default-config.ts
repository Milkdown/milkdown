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
import type { EditorState, EditorView, MarkType } from '@milkdown/prose';

import { ButtonConfig } from './button';
import { SelectConfig } from './select';

export type CommonConfig = {
    disabled?: (view: EditorView) => boolean;
};

export type ConfigItem = SelectConfig | ButtonConfig;

export type Config = Array<Array<ConfigItem>>;

export const hasMark = (state: EditorState, type: MarkType): boolean => {
    const { from, $from, to, empty } = state.selection;
    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    }
    return state.doc.rangeHasMark(from, to, type);
};

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
            active: (view) => hasMark(view.state, view.state.schema.marks.strong),
        },
        {
            type: 'button',
            icon: 'italic',
            key: ToggleItalic,
            active: (view) => hasMark(view.state, view.state.schema.marks.em),
        },
        {
            type: 'button',
            icon: 'strikeThrough',
            key: ToggleStrikeThrough,
            active: (view) => hasMark(view.state, view.state.schema.marks.strike_through),
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
