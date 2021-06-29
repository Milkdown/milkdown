import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';

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
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (node, state) => {
            state.openNode('blockquote');
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)];
}
