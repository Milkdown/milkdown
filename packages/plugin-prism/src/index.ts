import { createPlugin } from '@milkdown/core';
import { Prism } from './prism';

export const prismPlugin = createPlugin({
    prosemirror: (schema) => {
        if (!schema.nodes.fence) {
            throw new Error('[Milkdown Prism Plugin]: load failed, No code fence in schema!');
        }
        return {
            plugins: [Prism(schema.nodes.fence.name)],
        };
    },
});
