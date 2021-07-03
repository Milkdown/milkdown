import type { NodeSpec } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { CommonNode } from '../utility/base';

export class Doc extends CommonNode {
    override readonly id = 'doc';
    override readonly schema: NodeSpec = {
        content: 'block+',
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'root',
        runner: (state, node, type) => {
            state.injectRoot(node, type);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === 'doc',
        runner: (state, node) => {
            state.openNode('root');
            state.next(node.content);
        },
    };
}
