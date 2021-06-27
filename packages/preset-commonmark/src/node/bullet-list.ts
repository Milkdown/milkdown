import type { NodeType, NodeSpec } from 'prosemirror-model';
import { NodeParserSpec, SerializerNode } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { CommonNode } from '../utility';

export class BulletList extends CommonNode {
    override readonly id = 'bullet_list';
    override readonly schema: NodeSpec = {
        content: 'list_item+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: (node) => {
            return ['ul', { class: this.getClassName(node.attrs, 'bullet-list') }, 0];
        },
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type, ordered }) => type === 'list' && !ordered,
        runner: (type, state, node) => {
            state.stack.openNode(type);
            state.next(node.children);
            state.stack.closeNode();
        },
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.renderList(node, '  ', () => '* ');
    };
    override inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)];
}
