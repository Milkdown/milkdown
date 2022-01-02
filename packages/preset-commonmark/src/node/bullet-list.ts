/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { wrapIn, wrappingInputRule } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['BulletList'];

export const WrapInBulletList = createCmdKey();

export const bulletList = createNode<Keys>((utils) => {
    const id = 'bullet_list';
    return {
        id,
        schema: () => ({
            content: 'listItem+',
            group: 'block',
            parseDOM: [{ tag: 'ul' }],
            toDOM: (node) => {
                return ['ul', { class: utils.getClassName(node.attrs, 'bullet-list') }, 0];
            },
            parseMarkdown: {
                match: ({ type, ordered }) => type === 'list' && !ordered,
                runner: (state, node, type) => {
                    state.openNode(type).next(node.children).closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('list', undefined, { ordered: false }).next(node.content).closeNode();
                },
            },
        }),
        inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
        commands: (nodeType) => [createCmd(WrapInBulletList, () => wrapIn(nodeType))],
        shortcuts: {
            [SupportedKeys.BulletList]: createShortcut(WrapInBulletList, 'Mod-Alt-8'),
        },
    };
});
