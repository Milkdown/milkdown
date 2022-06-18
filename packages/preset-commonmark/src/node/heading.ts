/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, editorViewCtx } from '@milkdown/core';
import { setBlockType } from '@milkdown/prose/commands';
import { textblockTypeInputRule } from '@milkdown/prose/inputrules';
import { Node } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey, Transaction } from '@milkdown/prose/state';
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

export const headingPluginKey = new PluginKey('MILKDOWN_ID');

const createId = (node: Node) =>
    node.textContent
        .replace(/[\p{P}\p{S}]/gu, '')
        .replace(/\s/g, '-')
        .toLowerCase()
        .trim();

export const heading = createNode<Keys, { getId: (node: Node) => string }>((utils, options) => {
    const id = 'heading';

    const getId = options?.getId ?? createId;

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
                    `h${node.attrs['level']}`,
                    {
                        id: node.attrs['id'] || getId(node),
                        class: utils.getClassName(node.attrs, `heading h${node.attrs['level']}`),
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    const depth = node['depth'] as number;
                    state.openNode(type, { level: depth });
                    state.next(node.children);
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.openNode('heading', undefined, { depth: node.attrs['level'] });
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
            const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
                const tr = state.tr;
                state.doc.descendants((node, pos) => {
                    if (node.type === type && !lock) {
                        if (node.textContent.trim().length === 0) {
                            return;
                        }
                        const attrs = node.attrs;
                        const id = getId(node);

                        if (attrs['id'] !== id) {
                            tr.setMeta(headingPluginKey, true).setNodeMarkup(pos, undefined, {
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
                                setTimeout(() => {
                                    walkThrough(view.state, (tr) => view.dispatch(tr));
                                }, 0);
                                return false;
                            },
                        },
                    },
                    appendTransaction: (transactions, _, nextState) => {
                        let tr: Transaction | null = null;

                        if (
                            transactions.every((transaction) => !transaction.getMeta(headingPluginKey)) &&
                            transactions.some((transaction) => transaction.docChanged)
                        ) {
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
