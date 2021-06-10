import type { NodeSpec, NodeType } from 'prosemirror-model';

import { ParserSpec, SerializerNode } from '@milkdown/core';
import { InputRule } from 'prosemirror-inputrules';
import { CommonMarkNode } from '../utility';

export class Image extends CommonMarkNode {
    override readonly id = 'image';
    override readonly schema: NodeSpec = {
        inline: true,
        attrs: {
            src: { default: '' },
            alt: { default: null },
            title: { default: null },
        },
        group: 'inline',
        draggable: true,
        marks: '',
        parseDOM: [
            {
                tag: 'img[src]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return {
                        src: dom.getAttribute('src') || '',
                        alt: dom.getAttribute('alt'),
                        title: dom.getAttribute('title'),
                    };
                },
            },
        ],
        toDOM: (node) => {
            if (node.attrs.src?.length > 0) {
                return ['img', { ...node.attrs, class: this.getClassName(node.attrs) }];
            }
            return [
                'div',
                { ...node.attrs, class: this.getClassName(node.attrs, 'image empty') },
                ['span', { contentEditable: 'false', class: 'icon' }],
                ['span', { contentEditable: 'false', class: 'placeholder' }],
            ];
        },
    };
    override readonly parser: ParserSpec = {
        node: 'image',
        getAttrs: (token) => ({
            src: token.attrGet('src') || '',
            alt: token.children?.[0]?.content || null,
            title: token.attrGet('title'),
        }),
    };
    override readonly serializer: SerializerNode = (state, node) => {
        const alt = state.utils.escape(node.attrs.alt || '');
        const title = node.attrs.title ? ' ' + state.utils.quote(node.attrs.title) : '';
        const link = state.utils.escape(node.attrs.src) + title;
        state.write(`![${alt}](${link}) `);
    };
    override readonly inputRules = (nodeType: NodeType) => [
        new InputRule(/!\[(?<alt>.*?)]\((?<filename>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
            const [okay, alt, src = '', title] = match;
            const { tr } = state;
            if (okay) {
                tr.replaceWith(start, end, nodeType.create({ src, alt, title }));
            }

            return tr;
        }),
    ];
}
