/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { markRule } from '@milkdown/prose';
import { toggleMark } from '@milkdown/prose/commands';
import { createMark, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from './supported-keys';

type Keys = SupportedKeys['StrikeThrough'];

export const ToggleStrikeThrough = createCmdKey('ToggleStrikeThrough');

const id = 'strike_through';
export const strikeThrough = createMark<Keys>((utils) => {
    return {
        id,
        schema: () => ({
            parseDOM: [
                { tag: 'del' },
                { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
            ],
            toDOM: (mark) => ['del', { class: utils.getClassName(mark.attrs, 'strike-through') }],
            parseMarkdown: {
                match: (node) => node.type === 'delete',
                runner: (state, node, markType) => {
                    state.openMark(markType);
                    state.next(node.children);
                    state.closeMark(markType);
                },
            },
            toMarkdown: {
                match: (mark) => mark.type.name === id,
                runner: (state, mark) => {
                    state.withMark(mark, 'delete');
                },
            },
        }),
        inputRules: (markType) => [
            markRule(/(?:~~)([^~]+)(?:~~)$/, markType),
            markRule(/(?:^|[^~])(~([^~]+)~)$/, markType),
        ],
        commands: (markType) => [createCmd(ToggleStrikeThrough, () => toggleMark(markType))],
        shortcuts: {
            [SupportedKeys.StrikeThrough]: createShortcut(ToggleStrikeThrough, 'Mod-Alt-x'),
        },
    };
});
