import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '../utility';

type Keys = SupportedKeys.BulletList;

export class BulletList extends BaseNode<Keys> {
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
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.BulletList]: {
            defaultKey: 'Mod-Shift-8',
            command: wrapIn(nodeType),
        },
    });
}
