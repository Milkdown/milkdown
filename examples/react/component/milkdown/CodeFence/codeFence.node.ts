/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, editorViewCtx } from '@milkdown/core';
import { codeFence as originalCodeFence } from '@milkdown/preset-commonmark';
import { Fragment, Node } from '@milkdown/prose/model';
import { RenderReact } from '@milkdown/react';

const languageOptions = [
    '',
    'javascript',
    'typescript',
    'bash',
    'sql',
    'json',
    'html',
    'css',
    'c',
    'cpp',
    'java',
    'ruby',
    'python',
    'go',
    'rust',
    'markdown',
];

const id = 'fence';

export const languageListSlice = createSlice([] as string[], 'languageList');

export const codeFence: (view: ReturnType<RenderReact<Node>>) => typeof originalCodeFence = (view) =>
    originalCodeFence.extend(
        (original, utils, options) => {
            const languageList = options?.languageList || languageOptions;
            return {
                ...original,
                schema: (ctx) => {
                    return {
                        ...original.schema(ctx),
                        attrs: {
                            language: {
                                default: '',
                            },
                            filename: {
                                default: '',
                            },
                            fold: {
                                default: true,
                            },
                            showInput: {
                                default: false,
                            },
                        },
                        parseDOM: [
                            {
                                tag: 'div.code-fence-container',
                                preserveWhitespace: 'full',
                                getAttrs: (dom) => {
                                    if (!(dom instanceof HTMLElement)) {
                                        throw new Error('Parse DOM error.');
                                    }
                                    const pre = dom.querySelector('pre');
                                    return {
                                        language: pre?.dataset['language'],
                                        filename: pre?.dataset['filename'],
                                    };
                                },
                                getContent: (dom, schema) => {
                                    if (!(dom instanceof HTMLElement)) {
                                        throw new Error('Parse DOM error.');
                                    }
                                    const textNode = schema.text(dom.querySelector('pre')?.textContent ?? '');
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    return Fragment.from(textNode);
                                },
                            },
                            {
                                tag: 'pre',
                                preserveWhitespace: 'full',
                                getAttrs: (dom) => {
                                    if (!(dom instanceof HTMLElement)) {
                                        throw new Error('Parse DOM error.');
                                    }
                                    return { language: dom.dataset['language'], filename: dom.dataset['filename'] };
                                },
                            },
                        ],
                        toDOM: (node) => {
                            const select = document.createElement('select');
                            languageList.forEach((lang) => {
                                const option = document.createElement('option');
                                option.value = lang;
                                option.innerText = !lang ? '--' : lang;
                                if (lang === node.attrs['language']) {
                                    option.selected = true;
                                }
                                select.appendChild(option);
                            });
                            select.onchange = (e) => {
                                const target = e.target;
                                if (!(target instanceof HTMLSelectElement)) {
                                    return;
                                }
                                const view = ctx.get(editorViewCtx);
                                if (!view.editable) {
                                    target.value = node.attrs['language'];
                                    return;
                                }

                                const { top, left } = target.getBoundingClientRect();
                                const result = view.posAtCoords({ top, left });
                                if (!result) return;

                                const { tr } = view.state;

                                view.dispatch(
                                    tr.setNodeMarkup(result.inside, undefined, {
                                        ...node.attrs,
                                        language: target.value,
                                    }),
                                );
                            };
                            return [
                                'div',
                                {
                                    class: 'code-fence-container',
                                },
                                ['span', node.attrs['filename']],
                                select,
                                [
                                    'pre',
                                    {
                                        'data-language': node.attrs['language'],
                                        'data-filename': node.attrs['filename'],
                                        class: utils.getClassName(node.attrs, 'code-fence'),
                                    },
                                    ['code', { spellCheck: 'false' }, 0],
                                ],
                            ];
                        },
                        parseMarkdown: {
                            match: ({ type }) => type === 'code',
                            runner: (state, node, type) => {
                                const meta = node['meta'] as string;
                                let filename = '';
                                if (meta) {
                                    const match = meta.match(/^\[(\w+)\]$/);
                                    if (match) {
                                        filename = match[1] || '';
                                    }
                                }
                                const language = node['lang'] as string;
                                const value = node['value'] as string;
                                state.openNode(type, { language, filename });
                                if (value) {
                                    state.addText(value);
                                }
                                state.closeNode();
                            },
                        },
                        toMarkdown: {
                            match: (node) => node.type.name === id,
                            runner: (state, node) => {
                                const filename = node.attrs['filename'];
                                const meta = filename ? `[${filename}]` : '';
                                state.addNode('code', undefined, node.content.firstChild?.text || '', {
                                    lang: node.attrs['language'],
                                    meta,
                                });
                            },
                        },
                    };
                },
                view: (ctx) => {
                    ctx.set(languageListSlice, languageList);
                    return view(ctx);
                },
            };
        },
        [languageListSlice],
    );
