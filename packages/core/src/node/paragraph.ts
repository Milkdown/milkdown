import { Node } from '../abstract/node';
import { SerializerNode } from '../serializer/types';

export class Paragraph extends Node {
    name = 'paragraph';
    schema = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', 0] as const,
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderInline(node).closeBlock(node);
    };
    inputRules = () => [];
}
