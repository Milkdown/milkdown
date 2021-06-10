import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode } from '@milkdown/core';

import { wrappingInputRule } from 'prosemirror-inputrules';
import { CommonMarkNode } from '../utility';

export class Blockquote extends CommonMarkNode {
    override readonly id = 'blockquote';
    override readonly schema: NodeSpec = {
        content: 'block+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'blockquote' }],
        toDOM: (node) => ['blockquote', { class: this.getClassName(node.attrs) }, 0],
    };
    override readonly parser = {
        block: this.id,
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.wrapBlock('> ', node, () => state.renderContent(node));
    };
    override readonly inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)];
}
