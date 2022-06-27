/* Copyright 2021, Milkdown by Mirone. */
// import { SupportedKeys } from '@milkdown/preset-commonmark';
import { createNode } from '@milkdown/utils';

import { attributesToString } from './utils';

const id = 'directiveTextFallback';

export const directiveTextNode = createNode(() => {
    return {
        id,
        schema: () => ({
            attrs: {
                name: {
                    default: '',
                },
                type: {
                    default: '',
                },
                attrString: {
                    default: '',
                },
            },
            group: 'inline',
            inline: true,
            parseMarkdown: {
                match: ({ type }) => type === 'textDirective',
                runner: (state, node) => {
                    state.addText(
                        `:${node['name']}${attributesToString(
                            node['attributes'] as Record<string, string>,
                            node.children,
                        )}`,
                    );
                },
            },

            toMarkdown: {
                match: () => false,
                runner: () => null,
            },
        }),
    };
});
