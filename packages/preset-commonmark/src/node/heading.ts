/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, editorViewCtx } from '@milkdown/core';
import {
    EditorState,
    Node,
    Plugin,
    PluginKey,
    setBlockType,
    textblockTypeInputRule,
    Transaction,
} from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

const headingIndex = Array(6)
    .fill(0)
    .map((_, i) => i + 1);

type Keys =
    | SupportedKeys['H1']
    | SupportedKeys['H2']
    | SupportedKeys['H3']
    | SupportedKeys['H4']
    | SupportedKeys['H5']
    | SupportedKeys['H6'];

export const TurnIntoHeading = createCmdKey<number>('TurnIntoHeading');

export const headingPluginKey = new PluginKey('MILKDOWN_PLUGIN_ID');

export const heading = createNode<Keys>((utils) => {
    const id = 'heading';

    const style = (level: number) =>
        utils.getStyle((_, { css }) => {
            const headingMap: Record<number, string> = {
                1: css`
                    font-size: 3rem;
                    line-height: 3.5rem;
                `,
                2: css`
                    font-size: 2.5rem;
                    line-height: 3rem;
                `,
                3: css`
                    font-size: 2.125rem;
                    line-height: 2.25rem;
                `,
                4: css`
                    font-size: 1.75rem;
                    line-height: 2rem;
                `,
                5: css`
                    font-size: 1.5rem;
                    line-height: 1.5rem;
                `,
                6: css`
                    font-size: 1.25rem;
                    line-height: 1.25rem;
                `,
            };

            return css`
                ${headingMap[level] || ''}
                margin: 2.5rem 0 !important;
                font-weight: 400;
            `;
        });

    return {
        id,
        schema: () => ({
            content: 'inline*',
            group: 'block',
            defining: true,
            attrs: {
                id: {
                    default: '',
                },
                level: {
                    default: 1,
                },
            },
            parseDOM: headingIndex.map((x) => ({
                tag: `h${x}`,
                getAttrs: (node) => {
                    if (!(node instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return { level: x, id: node.id };
                },
            })),
            toDOM: (node) => {
                return [
                    `h${node.attrs.level}`,
                    {
                        id: node.attrs.id || node.textContent.split(' ').join('-').toLocaleLowerCase(),
                        class: utils.getClassName(node.attrs, `heading h${node.attrs.level}`, style(node.attrs.level)),
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    const depth = node.depth as number;
                    state.openNode(type, { level: depth });
                    state.next(node.children);
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('heading', undefined, { depth: node.attrs.level });
                    state.next(node.content);
                    state.closeNode();
                },
            },
        }),
        inputRules: (type) =>
            headingIndex.map((x) =>
                textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), type, () => ({
                    level: x,
                })),
            ),
        commands: (type) => [createCmd(TurnIntoHeading, (level = 1) => setBlockType(type, { level }))],
        shortcuts: {
            [SupportedKeys.H1]: createShortcut(TurnIntoHeading, 'Mod-Alt-1', 1),
            [SupportedKeys.H2]: createShortcut(TurnIntoHeading, 'Mod-Alt-2', 2),
            [SupportedKeys.H3]: createShortcut(TurnIntoHeading, 'Mod-Alt-3', 3),
            [SupportedKeys.H4]: createShortcut(TurnIntoHeading, 'Mod-Alt-4', 4),
            [SupportedKeys.H5]: createShortcut(TurnIntoHeading, 'Mod-Alt-5', 5),
            [SupportedKeys.H6]: createShortcut(TurnIntoHeading, 'Mod-Alt-6', 6),
        },
        prosePlugins: (type, ctx) => {
            let lock = false;
            const createId = (node: Node) => {
                return node.textContent
                    .replace(/[\p{P}\p{S}]/gu, '')
                    .replace(/\s/g, '')
                    .trim();
            };
            const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
                const tr = state.tr;
                state.doc.descendants((node, pos) => {
                    if (node.type === type && !lock) {
                        if (node.textContent.trim().length === 0) {
                            return;
                        }
                        const attrs = node.attrs;
                        const id = createId(node);

                        if (attrs.id !== id) {
                            tr.setNodeMarkup(pos, undefined, {
                                ...attrs,
                                id,
                            });
                        }
                    }
                });
                callback(tr);
            };
            return [
                new Plugin({
                    key: headingPluginKey,
                    props: {
                        handleDOMEvents: {
                            compositionstart: () => {
                                lock = true;
                                return false;
                            },
                            compositionend: () => {
                                lock = false;
                                const view = ctx.get(editorViewCtx);
                                walkThrough(view.state, (tr) => view.dispatch(tr));
                                return false;
                            },
                        },
                    },
                    appendTransaction: (transactions, _, nextState) => {
                        let tr: Transaction | null = null;

                        if (transactions.some((transaction) => transaction.docChanged)) {
                            walkThrough(nextState, (t) => {
                                tr = t;
                            });
                        }

                        return tr;
                    },
                }),
            ];
        },
    };
});
