/* Copyright 2021, Milkdown by Mirone. */
import { createNode } from '@milkdown/utils';

import { schema } from './schema';

export const tableHeader = createNode(() => {
    const id = 'table_header';
    return {
        id,
        schema: schema.table_header,
        parser: {
            match: (node) => node.type === 'tableCell' && !!node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state.openNode(type, { alignment: align });
                state.openNode(state.schema.nodes.paragraph);
                state.next(node.children);
                state.closeNode();
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});
