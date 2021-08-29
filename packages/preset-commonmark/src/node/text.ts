/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';

export const text = createNode(() => ({
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
}));
