/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { createPlugin, createShortcut } from '@milkdown/utils';
import { UnknownRecord } from '@milkdown/utils/src/types';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['HardBreak'];

export const InsertHardbreak = createCmdKey();

export const hardbreak = createPlugin<Keys, UnknownRecord, 'hardbreak', ''>((_, utils) => {
    return {
        schema: () => ({
            node: {
                hardbreak: {
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
                },
            },
        }),
        commands: (types) => [
            createCmd(InsertHardbreak, () => (state, dispatch) => {
                dispatch?.(state.tr.replaceSelectionWith(types.hardbreak.create()).scrollIntoView());
                return true;
            }),
        ],
        keymap: () => ({
            [SupportedKeys.HardBreak]: createShortcut(InsertHardbreak, 'Shift-Enter'),
        }),
    };
});
