/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { markRule, toggleMark } from '@milkdown/prose';
import { createMark, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Bold'];
const id = 'strong';
export const ToggleBold = createCmdKey('ToggleBold');
export const strong = createMark<Keys>((utils) => {
    const style = utils.getStyle(
        (_, { css }) =>
            css`
                font-weight: 600;
            `,
    );
    return {
        id,
        schema: () => ({
            parseDOM: [
                { tag: 'b' },
                { tag: 'strong' },
                { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
            ],
            toDOM: (mark) => ['strong', { class: utils.getClassName(mark.attrs, id, style) }],
            parseMarkdown: {
                match: (node) => node.type === 'strong',
                runner: (state, node, markType) => {
                    state.openMark(markType);
                    state.next(node.children);
                    state.closeMark(markType);
                },
            },
            toMarkdown: {
                match: (mark) => mark.type.name === id,
                runner: (state, mark) => {
                    state.withMark(mark, 'strong');
                },
            },
        }),
        inputRules: (markType) => [
            markRule(/(?:__)([^_]+)(?:__)$/, markType),
            markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
        ],
        commands: (markType) => [createCmd(ToggleBold, () => toggleMark(markType))],
        shortcuts: {
            [SupportedKeys.Bold]: createShortcut(ToggleBold, 'Mod-b'),
        },
    };
});
