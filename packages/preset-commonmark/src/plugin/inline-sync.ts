/* Copyright 2021, Milkdown by Mirone. */
import { Ctx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core';
import { Attrs, Node } from '@milkdown/prose/model';
import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from '@milkdown/prose/state';
import { pipe } from '@milkdown/utils';

const linkRegexp = /\[(?<span>((www|https:\/\/|http:\/\/)\S+))]\((?<url>\S+)\)/;

const holePlaceholder = '∅';

// punctuation placeholder
const punPlaceholder = '⁂';
// character placeholder
const chaPlaceholder = '∴';

const regexp = new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g');

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

const movePlaceholder = (text: string) => {
    const symbolsNeedToMove = ['*', '_'];

    let index = text.indexOf(holePlaceholder);
    while (symbolsNeedToMove.includes(text[index - 1] || '') && symbolsNeedToMove.includes(text[index + 1] || '')) {
        text = swap(text, index, index + 1);
        index = index + 1;
    }

    return text;
};

const removeLf = (text: string) => text.slice(0, -1);
const replacePunctuation = (text: string) => text.replace(regexp, '');
const handleText = pipe(removeLf, replacePunctuation, movePlaceholder, keepLink);

const calculatePlaceholder = (text: string) => {
    const index = text.indexOf(holePlaceholder);
    const left = text.charAt(index - 1);
    const right = text.charAt(index + 1);
    const notAWord = /[^\w]|_/;

    // cursor on the right
    if (!right) {
        return punPlaceholder;
    }

    // cursor on the left
    if (!left) {
        return chaPlaceholder;
    }

    if (notAWord.test(left) && notAWord.test(right)) {
        return punPlaceholder;
    }

    return chaPlaceholder;
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

        const markdown = serializer(doc);

        const text = handleText(markdown);
        const placeholder = calculatePlaceholder(text);

        const parsed = parser(text.replace(holePlaceholder, placeholder));
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
            isInlineBlock,
            prevNode: node,
            nextNode: target,
            placeholder,
        };
    };

    const runReplacer = (state: EditorState, dispatch: (tr: Transaction) => void, attrs: Attrs) => {
        // insert a placeholder to restore the selection
        let tr = state.tr.setMeta(inlineSyncPluginKey, true).insertText(holePlaceholder, state.selection.from);

        const nextState = state.apply(tr);
        const context = getContextByState(nextState);

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

                const context = getContextByState(newState);
                if (!context) return null;

                const { isInlineBlock, prevNode, nextNode } = context;

                if (!isInlineBlock) return null;
                if (!nextNode || prevNode.type !== nextNode.type || prevNode.eq(nextNode)) return null;

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
