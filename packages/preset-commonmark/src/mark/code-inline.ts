/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createCmd, createCmdKey } from '@milkdown/core';
import { markRule, toggleMark } from '@milkdown/prose';
import { createMark, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['CodeInline'];
const id = 'code_inline';

export const ToggleInlineCode = createCmdKey();

export const codeInline = createMark<Keys>((_, utils) => {
    const style = utils.getStyle(
        ({ palette, size, font }) =>
            css`
                background-color: ${palette('neutral')};
                color: ${palette('background')};
                border-radius: ${size.radius};
                font-weight: 500;
                font-family: ${font.code};
                padding: 0 0.2rem;
            `,
    );
    return {
        id,
        schema: {
            excludes: '_',
            parseDOM: [{ tag: 'code' }],
            toDOM: (mark) => ['code', { class: utils.getClassName(mark.attrs, 'code-inline', style) }],
        },
        parser: {
            match: (node) => node.type === 'inlineCode',
            runner: (state, node, markType) => {
                state.openMark(markType);
                state.addText(node.value as string);
                state.closeMark(markType);
            },
        },
        serializer: {
            match: (mark) => mark.type.name === id,
            runner: (state, _, node) => {
                state.addNode('inlineCode', undefined, node.text || '');

                return true;
            },
        },
        inputRules: (markType) => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)],
        commands: (markType) => [createCmd(ToggleInlineCode, () => toggleMark(markType))],
        shortcuts: {
            [SupportedKeys.CodeInline]: createShortcut(ToggleInlineCode, 'Mod-e'),
        },
    };
});
