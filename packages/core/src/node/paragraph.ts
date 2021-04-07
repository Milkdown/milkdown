import type { SerializerNode } from '../serializer/types';

import { Node } from '../abstract';

export class Paragraph extends Node {
    name = 'paragraph';
    schema = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', { class: 'paragraph' }, 0] as const,
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderInline(node).closeBlock(node);
    };
    inputRules = () => [];
    keymap = () => ({});
}
