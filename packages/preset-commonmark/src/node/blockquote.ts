/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { createCmd, createCmdKey } from '@milkdown/core';
import { wrapIn, wrappingInputRule } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Blockquote'];

const id = 'blockquote';

export const WrapInBlockquote = createCmdKey();

export const blockquote = createNode<Keys>((utils) => {
    const style = utils.getStyle(
        (themeTool) =>
            css`
                padding-left: 1.875rem;
                line-height: 1.75rem;
                border-left: 4px solid ${themeTool.palette('primary')};
                * {
                    font-size: 1rem;
                    line-height: 1.5rem;
                }
            `,
    );

    return {
        id,
        schema: () => ({
            content: 'block+',
            group: 'block',
            defining: true,
            parseDOM: [{ tag: 'blockquote' }],
            toDOM: (node) => ['blockquote', { class: utils.getClassName(node.attrs, id, style) }, 0],
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    state.openNode(type).next(node.children).closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('blockquote').next(node.content).closeNode();
                },
            },
        }),
        inputRules: (nodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)],
        commands: (nodeType) => [createCmd(WrapInBlockquote, () => wrapIn(nodeType))],
        shortcuts: {
            [SupportedKeys.Blockquote]: createShortcut(WrapInBlockquote, 'Mod-Shift-b'),
        },
    };
});
