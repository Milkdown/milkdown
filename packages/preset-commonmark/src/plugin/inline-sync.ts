/* Copyright 2021, Milkdown by Mirone. */
import { createSlice, Ctx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { Attrs, Node } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from '@milkdown/prose/state';
import { pipe } from '@milkdown/utils';

export type ShouldSyncNode = (context: {
    prevNode: Node;
    nextNode: Node;
    ctx: Ctx;
    tr: Transaction;
    text: string;
}) => boolean;

export type SyncNodePlaceholder = {
    hole: string;
    punctuation: string;
    char: string;
};

export type inlineSyncConfig = {
    placeholderConfig: SyncNodePlaceholder;
    shouldSyncNode: ShouldSyncNode;
    movePlaceholder: (placeholderToMove: string, text: string) => string;
};

export const inlineSyncConfigCtx = createSlice<inlineSyncConfig, 'inlineSyncConfig'>(
    {
        placeholderConfig: {
            hole: '∅',
            punctuation: '⁂',
            char: '∴',
        },
        shouldSyncNode: ({ prevNode, nextNode }) =>
            prevNode.inlineContent &&
            nextNode &&
            // if node type changes, do not sync
            prevNode.type === nextNode.type &&
            // if two node fully equal, we don't modify them
            !prevNode.eq(nextNode),
        movePlaceholder: (placeholderToMove: string, text: string) => {
            const symbolsNeedToMove = ['*', '_'];

            let index = text.indexOf(placeholderToMove);
            while (
                symbolsNeedToMove.includes(text[index - 1] || '') &&
                symbolsNeedToMove.includes(text[index + 1] || '')
            ) {
                text = swap(text, index, index + 1);
                index = index + 1;
            }

            return text;
        },
    },
    'inlineSyncConfig',
);

const linkRegexp = /\[(?<span>((www|https:\/\/|http:\/\/)\S+))]\((?<url>\S+)\)/;

const regexp = (holePlaceholder: string) => new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g');

const keepLink = (str: string) => {
    let text = str;
    let match = text.match(linkRegexp);
    while (match && match.groups) {
        const { span } = match.groups;
        text = text.replace(linkRegexp, span as string);

        match = text.match(linkRegexp);
    }
    return text;
};

const swap = (text: string, first: number, last: number) => {
    const arr = text.split('');
    const temp = arr[first];
    if (arr[first] && arr[last]) {
        arr[first] = arr[last] as string;
        arr[last] = temp as string;
    }
    return arr.join('').toString();
};

const removeLf = (text: string) => text.slice(0, -1);
const replacePunctuation = (holePlaceholder: string) => (text: string) => text.replace(regexp(holePlaceholder), '');

const calculatePlaceholder = (placeholder: SyncNodePlaceholder) => (text: string) => {
    const index = text.indexOf(placeholder.hole);
    const left = text.charAt(index - 1);
    const right = text.charAt(index + 1);
    const notAWord = /[^\w]|_/;

    // cursor on the right
    if (!right) {
        return placeholder.punctuation;
    }

    // cursor on the left
    if (!left) {
        return placeholder.char;
    }

    if (notAWord.test(left) && notAWord.test(right)) {
        return placeholder.punctuation;
    }

    return placeholder.char;
};

const getOffset = (node: Node, from: number, placeholder: string) => {
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

const getContextByState = (ctx: Ctx, state: EditorState) => {
    const { selection } = state;
    const { $from } = selection;

    const node = $from.node();
    const doc = state.schema.topNodeType.create(undefined, node);

    const parser = ctx.get(parserCtx);
    const serializer = ctx.get(serializerCtx);

    const markdown = serializer(doc);
    const config = ctx.get(inlineSyncConfigCtx);
    const holePlaceholder = config.placeholderConfig.hole;

    const movePlaceholder = (text: string) => config.movePlaceholder(holePlaceholder, text);

    const handleText = pipe(removeLf, replacePunctuation(holePlaceholder), movePlaceholder, keepLink);

    let text = handleText(markdown);
    const placeholder = calculatePlaceholder(config.placeholderConfig)(text);

    text = text.replace(holePlaceholder, placeholder);

    const parsed = parser(text);
    if (!parsed) return null;

    const target = parsed.firstChild;

    if (!target || node.type !== target.type) return null;

    // @ts-expect-error hijack the node attribute
    target.attrs = { ...node.attrs };

    target.descendants((node) => {
        const marks = node.marks;
        const link = marks.find((mark) => mark.type.name === 'link');
        if (link && node.text?.includes(placeholder) && link.attrs['href'].includes(placeholder)) {
            // @ts-expect-error hijack the mark attribute
            link.attrs['href'] = link.attrs['href'].replace(placeholder, '');
        }
    });

    return {
        text,
        prevNode: node,
        nextNode: target,
        placeholder,
    };
};

export const inlineSyncPluginKey = new PluginKey('MILKDOWN_INLINE_SYNC');
export const getInlineSyncPlugin = (ctx: Ctx) => {
    const runReplacer = (state: EditorState, dispatch: (tr: Transaction) => void, attrs: Attrs) => {
        const { placeholderConfig } = ctx.get(inlineSyncConfigCtx);
        const holePlaceholder = placeholderConfig.hole;
        // insert a placeholder to restore the selection
        let tr = state.tr.setMeta(inlineSyncPluginKey, true).insertText(holePlaceholder, state.selection.from);

        const nextState = state.apply(tr);
        const context = getContextByState(ctx, nextState);

        if (!context) return;

        const { $from } = nextState.selection;
        const from = $from.before();
        const to = $from.after();

        const offset = getOffset(context.nextNode, from, context.placeholder);

        tr = tr
            .replaceWith(from, to, context.nextNode)
            .setNodeMarkup(from, undefined, attrs)
            // delete the placeholder
            .delete(offset + 1, offset + 2);

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
                if (meta) {
                    return null;
                }

                const context = getContextByState(ctx, newState);
                if (!context) return null;

                const { prevNode, nextNode, text } = context;

                const { shouldSyncNode } = ctx.get(inlineSyncConfigCtx);

                if (!shouldSyncNode({ prevNode, nextNode, ctx, tr, text })) return null;

                requestAnimationFrame(() => {
                    const { dispatch, state } = ctx.get(editorViewCtx);

                    runReplacer(state, dispatch, prevNode.attrs);
                });

                return null;
            },
        },
    });

    return inlineSyncPlugin;
};
