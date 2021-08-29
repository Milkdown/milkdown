/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['HardBreak'];

const id = 'hardbreak';

export const InsertHardbreak = createCmdKey();

export const hardbreak = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: (node) => ['br', { class: utils.getClassName(node.attrs, id) }],
    },
    parser: {
        match: ({ type }) => type === 'break',
        runner: (state, _, type) => {
            state.addNode(type);
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state) => {
            state.addNode('break');
        },
    },
    commands: (nodeType) => [
        createCmd(InsertHardbreak, () => (state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView());
            return true;
        }),
    ],
    shortcuts: {
        [SupportedKeys.HardBreak]: createShortcut(InsertHardbreak, 'Shift-Enter'),
    },
}));
