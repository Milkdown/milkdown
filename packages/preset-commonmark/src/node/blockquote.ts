import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '@milkdown/utils';

type Keys = SupportedKeys.Blockquote;

export class Blockquote extends BaseNode<Keys> {
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
        runner: (state, node, type) => {
            state.openNode(type).next(node.children).closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('blockquote').next(node.content).closeNode();
        },
    };
    override readonly inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*>\s$/, nodeType)];
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.Blockquote]: {
            defaultKey: 'Mod-Shift-b',
            command: wrapIn(nodeType),
        },
    });
}
