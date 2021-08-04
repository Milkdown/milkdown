import { createNode } from '@milkdown/utils';
import nodeEmoji from 'node-emoji';
import { InputRule } from 'prosemirror-inputrules';
import { input } from './constant';
import { parse } from './parse';

export const emojiNode = createNode(() => ({
    id: 'emoji',
    schema: {
        group: 'inline',
        inline: true,
        selectable: false,
        marks: '',
        attrs: {
            html: {
                default: '',
            },
        },
        parseDOM: [
            {
                tag: 'span[data-type="emoji"]',
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
            span.dataset.type = 'emoji';
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
    inputRules: (nodeType) => [
        new InputRule(input, (state, match, start, end) => {
            const content = match[0];
            if (!content) return null;
            const got = nodeEmoji.get(content);
            if (!got || content.includes(got)) return null;

            const html = parse(got);

            return state.tr.replaceRangeWith(start, end, nodeType.create({ html })).scrollIntoView();
        }),
    ],
}));
