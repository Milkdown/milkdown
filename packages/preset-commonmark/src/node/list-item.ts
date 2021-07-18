import { createNode } from '@milkdown/utils';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '..';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

const id = 'list_item';
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
    commands: (nodeType) => ({
        [SupportedKeys.NextListItem]: {
            defaultKey: 'Enter',
            command: splitListItem(nodeType),
        },
        [SupportedKeys.SinkListItem]: {
            defaultKey: 'Mod-]',
            command: sinkListItem(nodeType),
        },
        [SupportedKeys.LiftListItem]: {
            defaultKey: 'Mod-[',
            command: liftListItem(nodeType),
        },
    }),
}));
