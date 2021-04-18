import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode, Node } from '@milkdown/core';

import { wrappingInputRule } from 'prosemirror-inputrules';

export class Blockquote extends Node {
    id = 'blockquote';
    schema: NodeSpec = {
        content: 'block+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'blockquote' }],
        toDOM: () => ['blockquote', { class: 'blockquote' }, 0],
    };
    parser = {
        block: this.id,
    };
    serializer: SerializerNode = (state, node) => {
        state.wrapBlock('> ', node, () => state.renderContent(node));
    };
    inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)];
}
