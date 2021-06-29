import type { NodeSpec } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { CommonNode } from '../utility/base';

export class Text extends CommonNode {
    override readonly id = 'text';
    override readonly schema: NodeSpec = {
        group: 'inline',
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'text',
        runner: (_, state, node) => {
            state.addText(node.value as string);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === 'text',
        runner: (node, state) => {
            state.addNode('text', undefined, node.text as string);
        },
    };
}
