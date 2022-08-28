/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state';

type InlineSyncPluginState = {
    isInlineBlock: boolean;
    originalNode: Node | null;
    targetNode: Node | null;
};
type InlineSyncPlugin = Plugin<InlineSyncPluginState>;

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC');
export const getInlineSyncPlugin = (ctx: Ctx) => {
    const inlineSyncPlugin: InlineSyncPlugin = new Plugin<InlineSyncPluginState>({
        key: inlineSyncPluginKey,
        state: {
            init: () => {
                return {
                    isInlineBlock: false,
                    originalNode: null,
                    targetNode: null,
                };
            },
            apply: (_tr, _value, _oldState, state) => {
                const { selection } = state;
                const { $from } = selection;

                const node = $from.node();
                const doc = state.schema.topNodeType.create(undefined, node);
                const isInlineBlock = Boolean(node.type.spec.content?.includes('inline'));

                const parser = ctx.get(parserCtx);
                const serializer = ctx.get(serializerCtx);
                const text = serializer(doc).slice(0, -1).replaceAll('\\', '');
                const parsed = parser(text);
                if (!parsed)
                    return {
                        isInlineBlock: false,
                        originalNode: null,
                        targetNode: null,
                    };

                const target = parsed.firstChild;

                if (!target || node.type !== target.type)
                    return {
                        isInlineBlock: false,
                        originalNode: null,
                        targetNode: null,
                    };

                return {
                    isInlineBlock,
                    originalNode: node,
                    targetNode: target,
                };
            },
        },
        props: {
            handleTextInput: (view, _, to) => {
                if (view.composing) return false;
                const pluginState = inlineSyncPlugin.getState(view.state);
                if (pluginState?.isInlineBlock) {
                    view.dispatch(view.state.tr.setMeta(inlineSyncPluginKey, true).insertText('\uFFFC', to));
                }
                return false;
            },
        },
        appendTransaction(transactions) {
            if (!transactions.some((tr) => tr.docChanged)) return null;
            if (!transactions.some((tr) => tr.getMeta(inlineSyncPluginKey))) return null;

            requestAnimationFrame(() => {
                const { state, dispatch } = ctx.get(editorViewCtx);

                const { selection } = state;
                const { $from } = selection;

                const pluginState = inlineSyncPlugin.getState(state);
                if (!pluginState) return;

                const { targetNode, originalNode } = pluginState;
                if (!targetNode || !originalNode) return;

                const from = $from.before();
                const to = $from.after();

                const tr = state.tr.setMeta('addToHistory', false).replaceWith(from, to, targetNode);

                let offset = from;
                let find = false;
                targetNode.descendants((n) => {
                    if (find) return false;
                    if (n.isText) {
                        const i = n.text?.indexOf('\uFFFC');
                        if (i != null && i >= 0) {
                            find = true;
                            offset += i;
                            return false;
                        }
                    }
                    offset += n.nodeSize;
                    return;
                });

                tr.delete(offset + 1, offset + 2);
                tr.setSelection(TextSelection.near(tr.doc.resolve(offset + 1)));
                dispatch(tr);
            });
            return null;
        },
    });

    return inlineSyncPlugin;
};
