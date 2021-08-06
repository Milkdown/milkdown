import { createNode } from '@milkdown/utils';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '..';
import { createCommand } from '@milkdown/core';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

const id = 'list_item';

export const SplitListItem = createCommand();
export const SinkListItem = createCommand();
export const LiftListItem = createCommand();

export const listItem = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        group: 'listItem',
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: (node) => ['li', { class: utils.getClassName(node.attrs, 'list-item') }, 0],
    },
    parser: {
        match: ({ type, checked }) => type === 'listItem' && checked === null,
        runner: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.openNode('listItem');
            state.next(node.content);
            state.closeNode();
        },
    },
    inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
    commands: (nodeType) => [
        [SplitListItem, splitListItem(nodeType)],
        [SinkListItem, sinkListItem(nodeType)],
        [LiftListItem, liftListItem(nodeType)],
    ],
    shortcuts: {
        [SupportedKeys.NextListItem]: {
            defaultKey: 'Enter',
            commandKey: SplitListItem,
        },
        [SupportedKeys.SinkListItem]: {
            defaultKey: 'Mod-]',
            commandKey: SinkListItem,
        },
        [SupportedKeys.LiftListItem]: {
            defaultKey: 'Mod-[',
            commandKey: LiftListItem,
        },
    },
}));
