/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { markRule, toggleMark } from '@milkdown/prose';
import { createMark, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Em'];

const id = 'em';

export const ToggleItalic = createCmdKey();

export const em = createMark<Keys>((utils) => ({
    id,
    schema: () => ({
        parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style', getAttrs: (value) => (value === 'italic') as false },
        ],
        toDOM: (mark) => ['em', { class: utils.getClassName(mark.attrs, id) }],
        parseMarkdown: {
            match: (node) => node.type === 'emphasis',
            runner: (state, node, markType) => {
                state.openMark(markType);
                state.next(node.children);
                state.closeMark(markType);
            },
        },
        toMarkdown: {
            match: (mark) => mark.type.name === id,
            runner: (state, mark) => {
                state.withMark(mark, 'emphasis');
            },
        },
    }),
    inputRules: (markType) => [
        markRule(/(?:^|[^_])(_([^_]+)_)$/, markType),
        markRule(/(?:^|[^*])(\*([^*]+)\*)$/, markType),
    ],
    commands: (markType) => [createCmd(ToggleItalic, () => toggleMark(markType))],
    shortcuts: {
        [SupportedKeys.Em]: createShortcut(ToggleItalic, 'Mod-i'),
    },
}));
