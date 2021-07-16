import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { setBlockType } from 'prosemirror-commands';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '@milkdown/utils';

type Keys = SupportedKeys['Text'];

export class Paragraph extends BaseNode<Keys> {
    override readonly id = 'paragraph';
    override readonly schema: NodeSpec = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: (node) => ['p', { class: this.getClassName(node.attrs) }, 0],
    };
    override readonly parser: NodeParserSpec = {
        match: (node) => node.type === this.id,
        runner: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
                state.next(node.children);
            } else {
                state.addText(node.value as string);
            }
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('paragraph');
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.Text]: {
            defaultKey: 'Mod-Alt-0',
            command: setBlockType(nodeType),
        },
    });
}
