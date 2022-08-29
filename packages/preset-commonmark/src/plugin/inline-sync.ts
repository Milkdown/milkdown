/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { Attrs, Node } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from '@milkdown/prose/state';

const placeholder = '⁂';
// const placeholder = '\u2234';
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

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC');
export const getInlineSyncPlugin = (ctx: Ctx) => {
    const getContextByState = (state: EditorState) => {
        const { selection } = state;
        const { $from } = selection;

        const node = $from.node();
        const doc = state.schema.topNodeType.create(undefined, node);
        const isInlineBlock = Boolean(node.type.spec.content?.includes('inline'));

        const parser = ctx.get(parserCtx);
        const serializer = ctx.get(serializerCtx);
        const text = serializer(doc).slice(0, -1).replaceAll(regexp, '');
        const parsed = parser(movePlaceholder(text));
        if (!parsed) return null;

        const target = parsed.firstChild;

        if (!target || node.type !== target.type) return null;

        return {
            text,
            isInlineBlock,
            prevNode: node,
            nextNode: target,
        };
    };

    const runReplacer = (
        prevState: EditorState,
        state: EditorState,
        dispatch: (tr: Transaction) => void,
        attrs: Attrs,
    ) => {
        const { selection } = state;
        const { $from } = selection;
        const from = $from.before();
        const to = $from.after();

        let tr = state.tr.setMeta(inlineSyncPluginKey, true).insertText(placeholder, selection.from);
        const cleanUpOnFail = () => {
            const offset = getOffset($from.node(), from);
            dispatch(tr.delete(offset + 1, offset + 2));
        };

        // If doc structure is changed, remove the placeholder.
        if (prevState.doc.resolve(from).node().type !== state.doc.resolve(from).node().type) {
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
            if (!find) return;

            dispatch(tr.delete(offset, offset + 1));

            return;
        }

        const context = getContextByState(state.apply(tr));

        if (!context) {
            cleanUpOnFail();
            return;
        }

        const offset = getOffset(context.nextNode, from);

        tr = tr.replaceWith(from, to, context.nextNode);
        tr = tr.setNodeMarkup(from, undefined, attrs);
        tr = tr.delete(offset + 1, offset + 2);
        tr = tr.setSelection(TextSelection.near(tr.doc.resolve(offset + 1)));
        dispatch(tr);
    };

    const inlineSyncPlugin = new Plugin<null>({
        key: inlineSyncPluginKey,
        state: {
            init: () => {
                return null;
            },
            apply: (tr, _value, _oldState, newState) => {
                if (!tr.docChanged) return null;

                const meta = tr.getMeta(inlineSyncPluginKey);
                if (meta) return null;

                const context = getContextByState(newState);
                if (!context) return null;

                const { isInlineBlock, prevNode, nextNode } = context;

                if (!isInlineBlock) return null;
                if (!nextNode || prevNode.type !== nextNode.type) return null;

                requestAnimationFrame(() => {
                    const { dispatch, state } = ctx.get(editorViewCtx);

                    runReplacer(newState, state, dispatch, prevNode.attrs);
                });

                return null;
            },
        },
    });

    return inlineSyncPlugin;
};
