import type { NodeType, NodeSpec } from 'prosemirror-model';
import { SerializerNode } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { CommonMarkNode } from '../utility';

export class BulletList extends CommonMarkNode {
    override readonly id = 'bullet_list';
    override readonly schema: NodeSpec = {
        content: 'list_item+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: (node) => {
            return ['ul', { class: this.getClassName(node.attrs, 'bullet-list') }, 0];
        },
    };
    override readonly parser = {
        block: this.id,
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.renderList(node, '  ', () => '* ');
    };
    override inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)];
}
