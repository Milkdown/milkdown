import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, SerializerNode } from '@milkdown/core';

import { wrappingInputRule } from 'prosemirror-inputrules';
import { CommonNode } from '../utility';

export class Blockquote extends CommonNode {
    override readonly id = 'blockquote';
    override readonly schema: NodeSpec = {
        content: 'block+',
        group: 'block',
        defining: true,
        parseDOM: [{ tag: 'blockquote' }],
        toDOM: (node) => ['blockquote', { class: this.getClassName(node.attrs) }, 0],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === this.id,
        runner: (type, state, node) => {
            state.stack.openNode(type);
            state.next(node.children);
            state.stack.closeNode();
        },
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.wrapBlock('> ', node, () => state.renderContent(node));
    };
    override readonly inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)];
}
