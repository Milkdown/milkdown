/* Copyright 2021, Milkdown by Mirone. */
import { RemarkPlugin } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { InputRule } from '@milkdown/prose/inputrules';
import { createNode } from '@milkdown/utils';
import nodeEmoji from 'node-emoji';
import remarkEmoji from 'remark-emoji';

import { input } from './constant';
import { filter } from './filter';
import { parse } from './parse';
import { twemojiPlugin } from './remark-twemoji';

export type EmojiOptions = {
    maxListSize: number;
};

export const emojiNode = createNode<string, EmojiOptions>((utils, options) => {
    const getStyle = () =>
        utils.getStyle(
            ({ css }) => css`
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
            atom: true,
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
                            throw expectDomTypeError(dom);
                        }
                        return { html: dom.innerHTML };
                    },
                },
            ],
            toDOM: (node) => {
                const span = document.createElement('span');
                span.classList.add('emoji-wrapper');
                span.dataset['type'] = 'emoji';
                utils.themeManager.onFlush(() => {
                    const style = getStyle();
                    if (style) {
                        span.classList.add(style);
                    }
                });
                span.innerHTML = node.attrs['html'];
                return { dom: span };
            },
            parseMarkdown: {
                match: ({ type }) => type === 'emoji',
                runner: (state, node, type) => {
                    state.addNode(type, { html: node['value'] as string });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'emoji',
                runner: (state, node) => {
                    const span = document.createElement('span');
                    span.innerHTML = node.attrs['html'];
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

                return state.tr
                    .setMeta('emoji', true)
                    .replaceRangeWith(start, end, nodeType.create({ html }))
                    .scrollIntoView();
            }),
        ],
        remarkPlugins: () => [remarkEmoji as RemarkPlugin, twemojiPlugin],
        prosePlugins: () => [filter(utils, options?.maxListSize ?? 6)],
    };
});
