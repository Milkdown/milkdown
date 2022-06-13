/* Copyright 2021, Milkdown by Mirone. */
import { findChildren } from '@milkdown/prose';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { refractor } from 'refractor/lib/common';

import type { Options } from '.';
import { getDecorations } from './get-decorations';

export const key = 'MILKDOWN_PRISM';

export function Prism(options: Options): Plugin {
    const { nodeName: name, configureRefractor } = options;
    return new Plugin({
        key: new PluginKey(key),
        state: {
            init: (_, { doc }) => {
                configureRefractor(refractor);
                return getDecorations(doc, name, refractor);
            },
            apply: (transaction, decorationSet, oldState, state) => {
                const isNodeName = state.selection.$head.parent.type.name === name;
                const isPreviousNodeName = oldState.selection.$head.parent.type.name === name;
                const oldNode = findChildren((node) => node.type.name === name)(oldState.doc);
                const newNode = findChildren((node) => node.type.name === name)(state.doc);
                const codeBlockChanged =
                    transaction.docChanged &&
                    (isNodeName ||
                        isPreviousNodeName ||
                        oldNode.length !== newNode.length ||
                        oldNode[0]?.node.attrs['language'] !== newNode[0]?.node.attrs['language'] ||
                        transaction.steps.some((step) => {
                            const s = step as unknown as { from: number; to: number };
                            return (
                                s.from !== undefined &&
                                s.to !== undefined &&
                                oldNode.some((node) => {
                                    return node.pos >= s.from && node.pos + node.node.nodeSize <= s.to;
                                })
                            );
                        }));

                if (codeBlockChanged) {
                    return getDecorations(transaction.doc, name, refractor);
                }

                return decorationSet.map(transaction.mapping, transaction.doc);
            },
        },
        props: {
            decorations(this: Plugin, state) {
                return this.getState(state);
            },
        },
    });
}
