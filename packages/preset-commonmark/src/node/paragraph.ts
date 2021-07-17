import { createNode } from '@milkdown/core';

export const paragraph = createNode({
    id: 'paragraph',
    schema: {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: () => ['p', { class: 'paragraph' }, 0],
    },
    parser: {
        match: (node) => node.type === 'paragraph',
        runner: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
                state.next(node.children);
            } else {
                state.addText(node.value as string);
            }
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === 'paragraph',
        runner: (state, node) => {
            state.openNode('paragraph');
            state.next(node.content);
            state.closeNode();
        },
    },
});
