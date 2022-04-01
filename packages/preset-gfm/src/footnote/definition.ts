/* Copyright 2021, Milkdown by Mirone. */

import { createNode } from '@milkdown/utils';

import { getFootnoteId } from './utils';

export const footnoteDefinition = createNode(() => {
    const id = 'footnote_definition';
    const markdownId = 'footnoteDefinition';

    return {
        id,
        schema: () => ({
            group: 'block',
            content: 'block+',
            defining: true,
            attrs: {
                label: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `div[data-type="${id}"]`,
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
            toDOM: (node) => [
                'div',
                { 'data-label': node.attrs['label'], id: getFootnoteId(node.attrs['label']), 'data-type': id },
                0,
            ],
            parseMarkdown: {
                match: ({ type }) => type === markdownId,
                runner: (state, node, type) => {
                    state
                        .openNode(type, {
                            label: node['label'] as string,
                        })
                        .next(node.children)
                        .closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state
                        .openNode(markdownId, undefined, {
                            label: node.attrs['label'],
                            identifier: node.attrs['label'],
                        })
                        .next(node.content)
                        .closeNode();
                },
            },
        }),
    };
});
