/* Copyright 2021, Milkdown by Mirone. */

import { createNode } from '@milkdown/utils';

import { getFootnoteDefId, getFootnoteRefId } from './utils';

export const footnoteReference = createNode(() => {
    const id = 'footnote_reference';

    return {
        id,
        schema: () => ({
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                label: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `sup[data-type="${id}"]`,
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            label: dom.dataset['label'],
                        };
                    },
                },
            ],
            toDOM: (node) => {
                const label = node.attrs['label'];
                return [
                    'sup',
                    {
                        'data-label': label,
                        'data-type': id,
                        id: getFootnoteRefId(label),
                    },
                    ['a', { href: `#${getFootnoteDefId(label)}` }, `[${label}]`],
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'footnoteReference',
                runner: (state, node, type) => {
                    state.addNode(type, {
                        label: node['label'] as string,
                    });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('footnoteReference', undefined, undefined, {
                        label: node.attrs['label'],
                        identifier: node.attrs['label'],
                    });
                },
            },
        }),
    };
});
