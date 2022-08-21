/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, Ctx, parserCtx, serializerCtx } from '@milkdown/core';
import { setBlockType } from '@milkdown/prose/commands';
import { Fragment, Node } from '@milkdown/prose/model';
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

export const inlineMarkSyncPluginKey = new PluginKey('MARK_INLINE_MARK_SYNC_PLUGIN_KEY');
export const inlineMarkSyncPlugin = (ctx: Ctx) => {
    ctx;
    return new Plugin({
        key: inlineMarkSyncPluginKey,
        appendTransaction(transactions, _oldState, newState) {
            if (!transactions.some((tr) => tr.docChanged)) return null;
            if (!newState.tr.isGeneric) return null;

            const { selection } = newState;
            const { $from } = selection;
            const node = $from.node();
            const isInlineBlock = node.type.spec.content?.includes('inline');
            if (!isInlineBlock) return null;

            const doc = newState.schema.topNodeType.createAndFill(undefined, node);
            if (!doc) return null;

            const parser = ctx.get(parserCtx);
            const serializer = ctx.get(serializerCtx);
            const text = serializer(doc).slice(0, -1).replaceAll('\\', '');
            console.log(text);

            const parsed = parser(text);

            if (!parsed) return null;
            console.log(parsed.firstChild);
            console.log(parsed.firstChild?.textContent);
            if (node.textContent === parsed.firstChild?.textContent) return null;

            const from = $from.before();
            const to = $from.after();
            console.log(JSON.stringify(text));
            console.log(from, to);
            let tr = newState.tr.setMeta('addToHistory', false).replaceWith(from, to, parsed.content);
            tr = tr.setSelection(TextSelection.near(tr.doc.resolve($from.pos)));
            return tr;
        },
    });
};

type Keys = SupportedKeys['Text'];

export const TurnIntoText = createCmdKey('TurnIntoText');

const id = 'paragraph';
export const paragraph = createNode<Keys>((utils) => {
    return {
        id,
        schema: () => ({
            content: 'inline*',
            group: 'block',
            parseDOM: [{ tag: 'p' }],
            toDOM: (node) => ['p', { class: utils.getClassName(node.attrs, id) }, 0],
            parseMarkdown: {
                match: (node) => node.type === 'paragraph',
                runner: (state, node, type) => {
                    state.openNode(type);
                    if (node.children) {
                        state.next(node.children);
                    } else {
                        state.addText(node['value'] as string);
                    }
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'paragraph',
                runner: (state, node) => {
                    state.openNode('paragraph');
                    const lastIsHardbreak = node.childCount >= 1 && node.lastChild?.type.name === 'hardbreak';
                    if (lastIsHardbreak) {
                        const contentArr: Node[] = [];
                        node.content.forEach((n, _, i) => {
                            if (i === node.childCount - 1) {
                                return;
                            }
                            contentArr.push(n);
                        });
                        state.next(Fragment.fromArray(contentArr));
                    } else {
                        state.next(node.content);
                    }
                    state.closeNode();
                },
            },
        }),
        commands: (nodeType) => [createCmd(TurnIntoText, () => setBlockType(nodeType))],
        shortcuts: {
            [SupportedKeys.Text]: createShortcut(TurnIntoText, 'Mod-Alt-0'),
        },
        prosePlugins: (_, ctx) => [inlineMarkSyncPlugin(ctx)],
    };
});
