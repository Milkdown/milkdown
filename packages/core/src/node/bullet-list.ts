import type { NodeType } from 'prosemirror-model';
import type { SerializerNode } from '../serializer/types';

import { wrappingInputRule } from 'prosemirror-inputrules';
import { Node } from '../abstract';

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
    keymap = () => ({});
}
