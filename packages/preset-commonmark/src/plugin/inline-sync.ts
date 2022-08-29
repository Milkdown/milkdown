/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state';

type InlineSyncPluginState = {
    text: string;
    isInlineBlock: boolean;
    originalNode: Node | null;
    targetNode: Node | null;
};
type InlineSyncPlugin = Plugin<InlineSyncPluginState>;

const placeholder = '⁂';
const regexp = new RegExp(`\\\\(?=[^\\w\\s${placeholder}\\\\]|_)`, 'g');

const swap = (text: string, first: number, last: number) => {
    const arr = text.split('');
    const temp = arr[first];
    if (arr[first] && arr[last]) {
        arr[first] = arr[last] as string;
        arr[last] = temp as string;
    }
    return arr.join('').toString();
};

const movePlaceholder = (text: string) => {
    const symbolsNeedToMove = ['*', '_'];

    let index = text.indexOf(placeholder);
    while (symbolsNeedToMove.includes(text[index - 1] || '') && symbolsNeedToMove.includes(text[index + 1] || '')) {
        text = swap(text, index, index + 1);
        index = index + 1;
    }

    return text;
};

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC');
export const getInlineSyncPlugin = (ctx: Ctx) => {
    const getOffset = (node: Node, from: number) => {
        let offset = from;
        let find = false;
        node.descendants((n) => {
            if (find) return false;
            if (n.isText) {
                const i = n.text?.indexOf(placeholder);
                if (i != null && i >= 0) {
                    find = true;
                    offset += i;
                    return false;
                }
            }
            offset += n.nodeSize;
            return;
        });
        return offset;
    };

    const getInitialState = (): InlineSyncPluginState => ({
        isInlineBlock: false,
        originalNode: null,
        targetNode: null,
        text: '',
    });

    const inlineSyncPlugin: InlineSyncPlugin = new Plugin<InlineSyncPluginState>({
        key: inlineSyncPluginKey,
        state: {
            init: () => {
                return getInitialState();
            },
            apply: (_tr, _value, _oldState, state) => {
                const { selection } = state;
                const { $from } = selection;

                const node = $from.node();
                const doc = state.schema.topNodeType.create(undefined, node);
                const isInlineBlock = Boolean(node.type.spec.content?.includes('inline'));

                const parser = ctx.get(parserCtx);
                const serializer = ctx.get(serializerCtx);
                const text = serializer(doc).slice(0, -1).replaceAll(regexp, '');
                const parsed = parser(movePlaceholder(text));
                if (!parsed) return getInitialState();

                const target = parsed.firstChild;

                if (!target || node.type !== target.type) return getInitialState();

                return {
                    text,
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
                    view.dispatch(view.state.tr.setMeta(inlineSyncPluginKey, true).insertText(placeholder, to));
                }
                return false;
            },
        },
        appendTransaction(transactions, _oldState, newState) {
            const triggerTr = transactions.find((tr) => tr.getMeta(inlineSyncPluginKey));
            if (!triggerTr) return null;

            requestAnimationFrame(() => {
                const { state, dispatch } = ctx.get(editorViewCtx);

                const { selection } = state;
                const { $from } = selection;
                const from = $from.before();
                const to = $from.after();

                const cleanUpOnFail = () => {
                    const offset = getOffset($from.node(), from);
                    dispatch(state.tr.delete(offset + 1, offset + 2));
                };

                // If doc structure is changed, remove the placeholder.
                if (newState.doc.resolve(from).node().type !== state.doc.resolve(from).node().type) {
                    let offset = 0;
                    let find = false;
                    state.doc.descendants((n, pos) => {
                        if (find) return false;
                        if (n.isText && n.text === placeholder) {
                            find = true;
                            offset = pos;
                        }
                        return;
                    });
                    dispatch(state.tr.delete(offset, offset + 1));

                    return;
                }

                const pluginState = inlineSyncPlugin.getState(state);
                if (!pluginState) {
                    cleanUpOnFail();
                    return;
                }

                const { targetNode, originalNode } = pluginState;
                if (!targetNode || !originalNode) {
                    cleanUpOnFail();
                    return;
                }

                const offset = getOffset(targetNode, from);

                let tr = state.tr.replaceWith(from, to, targetNode);
                tr = tr.delete(offset + 1, offset + 2);
                tr = tr.setSelection(TextSelection.near(tr.doc.resolve(offset + 1)));
                dispatch(tr);
            });
            return null;
        },
    });

    return inlineSyncPlugin;
};
