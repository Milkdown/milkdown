import type { NodeSpec } from 'prosemirror-model';
import { NodeParserSpec, SerializerNode } from '@milkdown/core';
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
    override readonly serializer: SerializerNode = (state, node) => {
        state.renderInline(node).closeBlock(node);
    };
}
