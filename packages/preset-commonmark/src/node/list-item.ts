import type { NodeType, NodeSpec } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { SerializerNode } from '@milkdown/core';
import { CommonMarkNode } from '../utility';

export class ListItem extends CommonMarkNode {
    override readonly id = 'list_item';
    override readonly schema: NodeSpec = {
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: (node) => ['li', { class: this.getClassName(node.attrs, 'list-item') }, 0],
    };
    override readonly parser = {
        block: this.id,
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.renderContent(node);
    };
    override readonly keymap = (type: NodeType): Keymap => ({
        Enter: splitListItem(type),
        'Mod-]': sinkListItem(type),
        'Mod-[': liftListItem(type),
    });
}
