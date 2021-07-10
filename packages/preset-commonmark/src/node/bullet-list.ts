import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { Keymap, wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
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
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('list', undefined, { ordered: false }).next(node.content).closeNode();
        },
    };
    override inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)];
    override readonly keymap = (nodeType: NodeType): Keymap => ({
        'Mod-Shift-8': wrapIn(nodeType),
    });
}
