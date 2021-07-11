import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import type { NodeSpec } from 'prosemirror-model';
import { BaseNode } from '../utility';

export class Text extends BaseNode {
    override readonly id = 'text';
    override readonly schema: NodeSpec = {
        group: 'inline',
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'text',
        runner: (state, node) => {
            state.addText(node.value as string);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === 'text',
        runner: (state, node) => {
            state.addNode('text', undefined, node.text as string);
        },
    };
}
