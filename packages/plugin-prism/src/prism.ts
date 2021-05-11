import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
import { getDecorations } from './get-decorations';

export const key = 'MILKDOWN_PLUGIN_PRISM';

export function Prism(name: string) {
    let highlighted = false;

    return new Plugin({
        key: new PluginKey(key),
        state: {
            init: (_, { doc }) => {
                return DecorationSet.create(doc, []);
            },
            apply: (transaction, decorationSet, oldState, state) => {
                const isNodeName = state.selection.$head.parent.type.name === name;
                const isPreviousNodeName = oldState.selection.$head.parent.type.name === name;
                const codeBlockChanged = transaction.docChanged && (isNodeName || isPreviousNodeName);

                if (!highlighted || codeBlockChanged) {
                    highlighted = true;
                    return getDecorations(transaction.doc, name);
                }

                return decorationSet.map(transaction.mapping, transaction.doc);
            },
        },
        view: (view) => {
            window.requestAnimationFrame(() => {
                view.dispatch(view.state.tr.setMeta(key, { loaded: true }));
            });
            return {};
        },
        props: {
            decorations(state) {
                return this.getState(state);
            },
        },
    });
}
