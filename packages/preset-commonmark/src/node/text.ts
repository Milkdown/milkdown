import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import type { NodeSpec } from 'prosemirror-model';
import { BaseNode } from '@milkdown/utils';
import { createNode } from '@milkdown/core';

export const text = createNode({
    id: 'text',
    schema: {
        group: 'inline',
    },
    parser: {
        match: ({ type }) => type === 'text',
        runner: (state, node) => {
            state.addText(node.value as string);
        },
    },
    serializer: {
        match: (node) => node.type.name === 'text',
        runner: (state, node) => {
            state.addNode('text', undefined, node.text as string);
        },
    },
});
