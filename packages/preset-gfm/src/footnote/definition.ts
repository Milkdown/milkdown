/* Copyright 2021, Milkdown by Mirone. */

import { createNode } from '@milkdown/utils';

import { getFootnoteDefId, getFootnoteRefId } from './utils';

export const footnoteDefinition = createNode((utils) => {
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
            toDOM: (node) => {
                const label = node.attrs['label'];
                const anchor = document.createElement('a');
                anchor.href = `#${getFootnoteRefId(label)}`;
                anchor.textContent = '↩';
                anchor.contentEditable = 'false';
                const className = utils.getClassName(node.attrs, 'footnote-definition');
                return [
                    'div',
                    {
                        class: className,
                        'data-label': label,
                        'data-type': id,
                        id: getFootnoteDefId(label),
                    },
                    ['div', { class: 'footnote-definition_content' }, ['dt', `${label}:`], ['dd', 0]],
                    ['div', { class: 'footnote-definition_anchor' }, anchor],
                ];
            },
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
