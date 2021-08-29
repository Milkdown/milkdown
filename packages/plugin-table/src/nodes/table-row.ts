import { createNode } from '@milkdown/utils';
import { Node as MarkdownNode } from 'unist';

import { schema } from './schema';

export const tableRow = createNode(() => {
    const id = 'table_row';
    return {
        id,
        schema: schema.table_row,
        parser: {
            match: (node) => node.type === 'tableRow',
            runner: (state, node, type) => {
                const align = node.align as (string | null)[];
                const children = (node.children as MarkdownNode[]).map((x, i) => ({
                    ...x,
                    align: align[i],
                    isHeader: node.isHeader,
                }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableRow');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});
