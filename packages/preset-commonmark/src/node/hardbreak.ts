/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, createShortcut } from '@milkdown/utils';
import { UnknownRecord } from '@milkdown/utils/src/types';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['HardBreak'];

export const InsertHardbreak = createCmdKey();

export const hardbreak = createNode<Keys, UnknownRecord>((utils) => {
    return {
        id: 'hardbreak',
        schema: () => ({
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }],
            toDOM: (node) => ['br', { class: utils.getClassName(node.attrs, 'hardbreak') }],
            parseMarkdown: {
                match: ({ type }) => type === 'break',
                runner: (state, _, type) => {
                    state.addNode(type);
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'hardbreak',
                runner: (state) => {
                    state.addNode('break');
                },
            },
        }),
        commands: (type) => [
            createCmd(InsertHardbreak, () => (state, dispatch) => {
                dispatch?.(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
                return true;
            }),
        ],
        shortcuts: {
            [SupportedKeys.HardBreak]: createShortcut(InsertHardbreak, 'Shift-Enter'),
        },
    };
});
