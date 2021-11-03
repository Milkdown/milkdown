/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';

export const doc = createNode(() => {
    return {
        id: 'doc',
        schema: () => ({
            content: 'block+',
            parseMarkdown: {
                match: ({ type }) => type === 'root',
                runner: (state, node, type) => {
                    state.injectRoot(node, type);
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'doc',
                runner: (state, node) => {
                    state.openNode('root');
                    state.next(node.content);
                },
            },
        }),
    };
});
