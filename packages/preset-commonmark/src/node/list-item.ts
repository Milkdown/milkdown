/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { getNodeFromSchema } from '@milkdown/prose';
import { wrappingInputRule } from '@milkdown/prose/inputrules';
import { NodeType } from '@milkdown/prose/model';
import { liftListItem, sinkListItem, splitListItem } from '@milkdown/prose/schema-list';
import { EditorState, Plugin, PluginKey, Transaction } from '@milkdown/prose/state';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['SinkListItem'] | SupportedKeys['LiftListItem'] | SupportedKeys['NextListItem'];

const id = 'list_item';

export const SplitListItem = createCmdKey('SplitListItem');
export const SinkListItem = createCmdKey('SinkListItem');
export const LiftListItem = createCmdKey('LiftListItem');

const keepListOrderPluginKey = new PluginKey('MILKDOWN_KEEP_LIST_ORDER');

const createKeepListOrderPlugin = (type: NodeType) => {
    const walkThrough = (state: EditorState, callback: (tr: Transaction) => void) => {
        const orderedListType = getNodeFromSchema('ordered_list', state.schema);
        let tr = state.tr;
        state.doc.descendants((node, pos, parent, index) => {
            if (node.type === type && parent?.type === orderedListType) {
                let changed = false;
                const attrs = { ...node.attrs };
                if (node.attrs['listType'] !== 'ordered') {
                    attrs['listType'] = 'ordered';
                    changed = true;
                }

                const prev = parent?.maybeChild(index - 1);
                if (prev && prev.type === type && prev.attrs['listType'] === 'ordered') {
                    const label = prev.attrs['label'];
                    attrs['label'] = `${Number(label.slice(0, -1)) + 1}.`;
                    changed = true;
                }

                if (node.attrs['label'] === '•') {
                    attrs['label'] = `${index + 1}.`;
                    changed = true;
                }

                if (changed) {
                    tr = tr.setNodeMarkup(pos, undefined, attrs);
                }
            }
        });
        callback(tr);
    };
    return new Plugin({
        key: keepListOrderPluginKey,
        appendTransaction: (transactions, _oldState, nextState) => {
            let tr: Transaction | null = null;
            if (transactions.some((transaction) => transaction.docChanged)) {
                walkThrough(nextState, (t) => {
                    tr = t;
                });
            }

            return tr;
        },
    });
};

export const listItem = createNode<Keys>((utils) => ({
    id,
    schema: () => ({
        group: 'listItem',
        content: 'paragraph block*',
        attrs: {
            label: {
                default: '•',
            },
            listType: {
                default: 'bullet',
            },
        },
        defining: true,
        parseDOM: [{ tag: 'li' }],
        toDOM: (node) => {
            return [
                'li',
                { class: utils.getClassName(node.attrs, 'list-item'), 'data-list-type': node.attrs['listType'] },
                ['div', { class: utils.getClassName(node.attrs, 'list-item_label') }, node.attrs['label']],
                ['div', { class: utils.getClassName(node.attrs, 'list-item_body') }, 0],
            ];
        },
        parseMarkdown: {
            match: ({ type, checked }) => type === 'listItem' && checked === null,
            runner: (state, node, type) => {
                const label = node['label'] != null ? `${node['label']}.` : '•';
                const listType = node['label'] != null ? 'ordered' : 'bullet';
                state.openNode(type, { label, listType });
                state.next(node.children);
                state.closeNode();
            },
        },
        toMarkdown: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('listItem');
                state.next(node.content);
                state.closeNode();
            },
        },
    }),
    inputRules: (nodeType) => [wrappingInputRule(/^\s*([-+*])\s$/, nodeType)],
    commands: (nodeType) => [
        createCmd(SplitListItem, () => splitListItem(nodeType)),
        createCmd(SinkListItem, () => sinkListItem(nodeType)),
        createCmd(LiftListItem, () => liftListItem(nodeType)),
    ],
    shortcuts: {
        [SupportedKeys.NextListItem]: createShortcut(SplitListItem, 'Enter'),
        [SupportedKeys.SinkListItem]: createShortcut(SinkListItem, 'Mod-]'),
        [SupportedKeys.LiftListItem]: createShortcut(LiftListItem, 'Mod-['),
    },
    prosePlugins: (nodeType) => [createKeepListOrderPlugin(nodeType)],
}));
