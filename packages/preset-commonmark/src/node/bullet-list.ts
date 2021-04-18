import type { NodeType } from 'prosemirror-model';
import { Node, SerializerNode } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class BulletList extends Node {
    id = 'bullet_list';
    schema = {
        content: 'list_item+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: () => ['ul', { class: 'bullet-list' }, 0] as const,
    };
    parser = {
        block: this.id,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderList(node, '  ', () => '* ');
    };
    inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)];
}
