/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';

import { schema } from './schema';

export const tableCell = createNode(() => {
    const id = 'table_cell';
    return {
        id,
        schema: schema.table_cell,
        parser: {
            match: (node) => node.type === 'tableCell' && !node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state
                    .openNode(type, { alignment: align })
                    .openNode(state.schema.nodes.paragraph)
                    .next(node.children)
                    .closeNode()
                    .closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell').next(node.content).closeNode();
            },
        },
    };
});
