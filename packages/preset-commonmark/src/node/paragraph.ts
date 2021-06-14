import type { NodeSpec } from 'prosemirror-model';
import { SerializerNode } from '@milkdown/core';
import { CommonNode } from '../utility/base';

export class Paragraph extends CommonNode {
    override readonly id = 'paragraph';
    override readonly schema: NodeSpec = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: (node) => ['p', { class: this.getClassName(node.attrs) }, 0],
    };
    override readonly parser = {
        block: this.id,
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.renderInline(node).closeBlock(node);
    };
}
