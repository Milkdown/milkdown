import { wrappingInputRule } from 'prosemirror-inputrules';
import { NodeType } from 'prosemirror-model';
import { Node } from '../abstract/node';
import { SerializerNode } from '../serializer/types';

export class BulletList extends Node {
    name = 'bullet_list';
    schema = {
        content: 'list_item+',
        group: 'block',
        parseDOM: [{ tag: 'ul' }],
        toDOM: () => ['ul', { class: 'bullet-list' }, 0] as const,
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderList(node, '  ', () => '* ');
    };
    inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)];
}
