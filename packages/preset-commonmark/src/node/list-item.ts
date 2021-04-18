import type { NodeType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { SerializerNode, Node } from '@milkdown/core';

export class ListItem extends Node {
    id = 'list_item';
    schema = {
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: () => ['li', { class: 'list-item' }, 0] as const,
    };
    parser = {
        block: this.id,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderContent(node);
    };
    keymap = (type: NodeType): Keymap => ({
        Enter: splitListItem(type),
        'Mod-]': sinkListItem(type),
        'Mod-[': liftListItem(type),
    });
}
