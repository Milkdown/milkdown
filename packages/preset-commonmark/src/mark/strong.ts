/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createCmd, createCmdKey } from '@milkdown/core';
import { createMark, createShortcut, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Bold'];
const id = 'strong';
export const ToggleBold = createCmdKey();
export const strong = createMark<Keys>((options, utils) => {
    const style = options?.headless
        ? null
        : css`
              font-weight: 600;
          `;
    return {
        id,
        schema: {
            parseDOM: [
                { tag: 'b' },
                { tag: 'strong' },
                { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
            ],
            toDOM: (mark) => ['strong', { class: utils.getClassName(mark.attrs, id, style) }],
        },
        parser: {
            match: (node) => node.type === 'strong',
            runner: (state, node, markType) => {
                state.openMark(markType);
                state.next(node.children);
                state.closeMark(markType);
            },
        },
        serializer: {
            match: (mark) => mark.type.name === id,
            runner: (state, mark) => {
                state.withMark(mark, 'strong');
            },
        },
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
