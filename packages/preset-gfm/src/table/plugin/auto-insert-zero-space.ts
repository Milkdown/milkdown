/* Copyright 2021, Milkdown by Mirone. */
import { browser } from '@milkdown/prose';
import { Node } from '@milkdown/prose/model';
import { Plugin, PluginKey } from '@milkdown/prose/state';

import { isInTable } from './util';

const isEmptyParagraph = (node: Node) => {
    return node.type.name === 'paragraph' && node.nodeSize === 2;
};

const isParagraph = (node: Node) => {
    return node.type.name === 'paragraph';
};

const pluginKey = new PluginKey('plugin_autoInsertZeroSpace');

export const autoInsertZeroSpace = () => {
    return new Plugin({
        key: pluginKey,
        props: {
            handleDOMEvents: {
                compositionstart(view) {
                    const { state, dispatch } = view;
                    const { tr, selection } = state;
                    const { $from } = selection;
                    if (browser.safari && isInTable(state) && selection.empty && isEmptyParagraph($from.parent)) {
                        dispatch(tr.insertText('\u2060', $from.start()));
                    }
                    return false;
                },
                compositionend(view) {
                    const { state, dispatch } = view;
                    const { tr, selection } = state;
                    const { $from } = selection;

                    if (
                        browser.safari &&
                        isInTable(state) &&
                        selection.empty &&
                        isParagraph($from.parent) &&
                        $from.parent.textContent.startsWith('\u2060')
                    ) {
                        dispatch(tr.delete($from.start(), $from.start() + 1));
                    }
                    return false;
                },
            },
        },
    });
};
