/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';

export const text = createNode(() => ({
    id: 'text',
    schema: () => ({
        group: 'inline',
        parseMarkdown: {
            match: ({ type }) => type === 'text',
            runner: (state, node) => {
                state.addText(node.value as string);
            },
        },
        toMarkdown: {
            match: (node) => node.type.name === 'text',
            runner: (state, node) => {
                state.addNode('text', undefined, node.text as string);
            },
        },
    }),
}));
