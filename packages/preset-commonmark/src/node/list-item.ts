import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '@milkdown/utils';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

export class ListItem extends BaseNode<Keys> {
    override readonly id = 'list_item';
    override readonly schema: NodeSpec = {
        group: 'listItem',
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: (node) => ['li', { class: this.getClassName(node.attrs, 'list-item') }, 0],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type, checked }) => type === 'listItem' && checked === null,
        runner: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('listItem');
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
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
    });
}
