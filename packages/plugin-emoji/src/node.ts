import { createNode } from '@milkdown/utils';
import nodeEmoji from 'node-emoji';
import { InputRule } from 'prosemirror-inputrules';
import twemoji from 'twemoji';

const shortEmoji = /:\+1:|:-1:|:[\w-]+:/;

export const emojiNode = createNode(() => ({
    id: 'emoji',
    schema: {
        group: 'inline',
        inline: true,
        selectable: false,
        attrs: {
            html: {
                default: '',
            },
        },
        parseDOM: [
            {
                tag: 'span[.emoji]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return { html: dom.innerHTML };
                },
            },
        ],
        toDOM: (node) => {
            const span = document.createElement('span');
            span.className = 'emoji';
            span.innerHTML = node.attrs.html;
            return { dom: span };
        },
    },
    parser: {
        match: ({ type }) => type === 'emoji',
        runner: (state, node, type) => {
            state.addNode(type, { html: node.value as string });
        },
    },
    serializer: {
        match: (node) => node.type.name === 'emoji',
        runner: (state, node) => {
            const span = document.createElement('span');
            span.innerHTML = node.attrs.html;
            const img = span.querySelector('img');
            const title = img?.title;
            span.remove();
            state.addNode('text', undefined, title);
        },
    },
    inputRules: (nodeType) => {
        return [
            new InputRule(shortEmoji, (state, match, start, end) => {
                const content = match[0];
                if (!content) return null;
                const got = nodeEmoji.get(content);
                if (!got || got === content) return null;

                const html = twemoji.parse(got, { attributes: (text) => ({ title: text }) });

                const tr = state.tr.replaceRangeWith(start, end, nodeType.create({ html })).scrollIntoView();
                return tr;
            }),
        ];
    },
}));
