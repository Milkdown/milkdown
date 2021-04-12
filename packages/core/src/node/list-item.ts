import type { NodeType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { splitListItem } from 'prosemirror-schema-list';
import type { SerializerNode } from '../serializer/types';
import { Node } from '../abstract';

export class ListItem extends Node {
    name = 'list_item';
    schema = {
        content: 'paragraph block*',
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: () => ['li', { class: 'list-item' }, 0] as const,
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderContent(node);
    };
    inputRules = () => [];
    keymap = (type: NodeType): Keymap => ({
        Enter: splitListItem(type),
    });
}
