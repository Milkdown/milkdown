import { Node } from '../abstract/node';
import { SerializerNode } from '../serializer/types';

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
}
