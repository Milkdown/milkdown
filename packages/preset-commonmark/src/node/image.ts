import type { NodeSpec, NodeType } from 'prosemirror-model';

import { ParserSpec, SerializerNode, Node } from '@milkdown/core';
import { InputRule } from 'prosemirror-inputrules';

export class Image extends Node {
    id = 'image';
    schema: NodeSpec = {
        inline: true,
        attrs: {
            src: {},
            alt: { default: null },
            title: { default: null },
        },
        group: 'inline',
        draggable: true,
        marks: '',
        parseDOM: [
            {
                tag: 'img[src]',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getAttrs: (dom: any) => ({
                    src: dom.getAttribute('src'),
                    alt: dom.getAttribute('alt'),
                    title: dom.getAttribute('title'),
                }),
            },
        ],
        toDOM: (node) => ['img', { ...node.attrs, class: 'image' }],
    };
    parser: ParserSpec = {
        node: 'image',
        getAttrs: (token) => {
            return {
                src: token.attrGet('src'),
                alt: token.children?.[0]?.content || null,
                title: token.attrGet('title'),
            };
        },
    };
    serializer: SerializerNode = (state, node) => {
        const alt = state.utils.escape(node.attrs.alt || '');
        const title = node.attrs.title ? ' ' + state.utils.quote(node.attrs.title) : '';
        const link = state.utils.escape(node.attrs.src) + title;
        state.write(`![${alt}](${link}) `);
    };
    inputRules = (nodeType: NodeType) => [
        new InputRule(/!\[(?<alt>.*?)]\((?<filename>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
            const [okay, alt, src, title] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src, alt, title }));
            }

            return tr;
        }),
    ];
}
