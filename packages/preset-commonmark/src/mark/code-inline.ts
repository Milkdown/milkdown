/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { markRule } from '@milkdown/prose';
import { toggleMark } from '@milkdown/prose/commands';
import { createMark, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['CodeInline'];
const id = 'code_inline';

export const ToggleInlineCode = createCmdKey('ToggleInlineCode');

export const codeInline = createMark<Keys>((utils) => {
    return {
        id,
        schema: () => ({
            priority: 100,
            code: true,
            inclusive: false,
            parseDOM: [{ tag: 'code' }],
            toDOM: (mark) => ['code', { class: utils.getClassName(mark.attrs, 'code-inline') }],
            parseMarkdown: {
                match: (node) => node.type === 'inlineCode',
                runner: (state, node, markType) => {
                    state.openMark(markType);
                    state.addText(node['value'] as string);
                    state.closeMark(markType);
                },
            },
            toMarkdown: {
                match: (mark) => mark.type.name === id,
                runner: (state, mark, node) => {
                    state.withMark(mark, 'inlineCode', node.text || '');
                },
            },
        }),
        inputRules: (markType) => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)],
        commands: (markType) => [createCmd(ToggleInlineCode, () => toggleMark(markType))],
        shortcuts: {
            [SupportedKeys.CodeInline]: createShortcut(ToggleInlineCode, 'Mod-e'),
        },
    };
});
