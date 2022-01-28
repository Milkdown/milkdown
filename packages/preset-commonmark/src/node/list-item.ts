/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { liftListItem, sinkListItem, splitListItem, wrappingInputRule } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

const id = 'list_item';

export const SplitListItem = createCmdKey('SplitListItem');
export const SinkListItem = createCmdKey('SinkListItem');
export const LiftListItem = createCmdKey('LiftListItem');

export const listItem = createNode<Keys>((utils) => {
    const style = utils.getStyle(
        (themeTool, { css }) =>
            css`
                &,
                & > * {
                    margin: 0.5rem 0;
                }

                &,
                li {
                    &::marker {
                        color: ${themeTool.palette('primary')};
                    }
                }
            `,
    );

    return {
        id,
        schema: () => ({
            group: 'listItem',
            content: 'paragraph block*',
            defining: true,
            parseDOM: [{ tag: 'li' }],
            toDOM: (node) => ['li', { class: utils.getClassName(node.attrs, 'list-item', style) }, 0],
            parseMarkdown: {
                match: ({ type, checked }) => type === 'listItem' && checked === null,
                runner: (state, node, type) => {
                    state.openNode(type);
                    state.next(node.children);
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('listItem');
                    state.next(node.content);
                    state.closeNode();
                },
            },
        }),
        inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
        commands: (nodeType) => [
            createCmd(SplitListItem, () => splitListItem(nodeType)),
            createCmd(SinkListItem, () => sinkListItem(nodeType)),
            createCmd(LiftListItem, () => liftListItem(nodeType)),
        ],
        shortcuts: {
            [SupportedKeys.NextListItem]: createShortcut(SplitListItem, 'Enter'),
            [SupportedKeys.SinkListItem]: createShortcut(SinkListItem, 'Mod-]'),
            [SupportedKeys.LiftListItem]: createShortcut(LiftListItem, 'Mod-['),
        },
    };
});
