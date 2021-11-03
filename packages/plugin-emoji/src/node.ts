/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { RemarkPlugin } from '@milkdown/core';
import { InputRule } from '@milkdown/prose';
import { createNode } from '@milkdown/utils';
import nodeEmoji from 'node-emoji';
import remarkEmoji from 'remark-emoji';

import { input } from './constant';
import { filter } from './filter';
import { parse } from './parse';
import { picker } from './picker';
import { twemojiPlugin } from './remark-twemoji';

export const emojiNode = createNode((utils) => {
    const style = utils.getStyle(
        () => css`
            display: inline-flex;
            justify-content: center;
            align-items: center;

            .emoji {
                height: 1em;
                width: 1em;
                margin: 0 0.05em 0 0.1em;
                vertical-align: -0.1em;
            }
        `,
    );
    return {
        id: 'emoji',
        schema: () => ({
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
                if (style) {
                    span.classList.add(style);
                }
                span.classList.add('emoji-wrapper');
                span.innerHTML = node.attrs.html;
                return { dom: span };
            },
            parseMarkdown: {
                match: ({ type }) => type === 'emoji',
                runner: (state, node, type) => {
                    state.addNode(type, { html: node.value as string });
                },
            },
            toMarkdown: {
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
        }),
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
        remarkPlugins: () => [remarkEmoji as RemarkPlugin, twemojiPlugin],
        prosePlugins: () => [picker(utils), filter(utils)],
    };
});
