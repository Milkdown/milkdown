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
        runner: (type, state, node) => {
            state.injectRoot(type, node);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === 'doc',
        runner: (node, state) => {
            state.openNode('root');
            state.next(node.content);
        },
    };
}
