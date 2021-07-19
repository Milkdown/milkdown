import { findChildren } from '@milkdown/utils';
import { Plugin, PluginKey } from 'prosemirror-state';
import { getDecorations } from './get-decorations';

export const key = 'MILKDOWN_PLUGIN_PRISM';

export function Prism(name: string) {
    return new Plugin({
        key: new PluginKey(key),
        state: {
            init: (_, { doc }) => {
                return getDecorations(doc, name);
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
                        oldNode[0]?.node.attrs.language !== newNode[0]?.node.attrs.language);

                if (codeBlockChanged) {
                    return getDecorations(transaction.doc, name);
                }

                return decorationSet.map(transaction.mapping, transaction.doc);
            },
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });
}
