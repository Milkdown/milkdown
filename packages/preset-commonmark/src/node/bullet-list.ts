import { createCommand } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '..';

type Keys = SupportedKeys['BulletList'];

export const WrapInBulletList = createCommand();

const id = 'bullet_list';
export const bulletList = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        content: 'listItem+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: (node) => {
            return ['ul', { class: utils.getClassName(node.attrs, 'bullet-list') }, 0];
        },
    },
    parser: {
        match: ({ type, ordered }) => type === 'list' && !ordered,
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.openNode('list', undefined, { ordered: false }).next(node.content).closeNode();
        },
    },
    inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
    commands: (nodeType) => [[WrapInBulletList, wrapIn(nodeType)]],
    shortcuts: {
        [SupportedKeys.BulletList]: {
            defaultKey: 'Mod-Shift-8',
            commandKey: WrapInBulletList,
        },
    },
}));
