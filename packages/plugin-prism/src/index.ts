import { createPlugin } from '@milkdown/core';
import { Prism } from './prism';

export const prismPlugin = createPlugin({
    prosemirror: (schema) => {
        return {
            plugins: [Prism(schema.nodes.fence.name)],
        };
    },
});
