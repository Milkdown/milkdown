/* Copyright 2021, Milkdown by Mirone. */

import { Node } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey } from '@milkdown/prose/state';
import { AtomList, AtomPlugin, createPlugin } from '@milkdown/utils';

export type ShouldAppend = (lastNode: Node | null, state: EditorState) => boolean;
export type Options = {
    shouldAppend: ShouldAppend;
    getNode: (state: EditorState) => Node;
};

export const trailingPluginKey = new PluginKey('MILKDOWN_TRAILING');

export const trailingPlugin = createPlugin<string, Options>((_, options) => ({
    prosePlugins: () => {
        const shouldAppend: ShouldAppend =
            options?.shouldAppend ??
            ((lastNode) => {
                if (!lastNode) return false;

                if (['heading', 'paragraph'].includes(lastNode.type.name)) {
                    return false;
                }

                return true;
            });
        const plugin = new Plugin({
            key: trailingPluginKey,
            state: {
                init: (_, state) => {
                    const lastNode = state.tr.doc.lastChild;

                    return shouldAppend(lastNode, state);
                },
                apply: (tr, value, _, state) => {
                    if (!tr.docChanged) {
                        return value;
                    }

                    const lastNode = tr.doc.lastChild;

                    return shouldAppend(lastNode, state);
                },
            },
            appendTransaction: (_, __, state) => {
                const { doc, tr, schema } = state;
                const nodeType = options?.getNode?.(state) ?? schema.nodes['paragraph']?.create();
                const shouldInsertNodeAtEnd = plugin.getState(state);
                const endPosition = doc.content.size;

                if (!shouldInsertNodeAtEnd || !nodeType) {
                    return;
                }

                return tr.insert(endPosition, nodeType);
            },
        });
        return [plugin];
    },
}));

export const trailing: AtomPlugin[] = AtomList.create([trailingPlugin()]);
