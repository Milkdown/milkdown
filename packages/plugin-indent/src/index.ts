/* Copyright 2021, Milkdown by Mirone. */

import { injectGlobal } from '@emotion/css';
import { createCmdKey } from '@milkdown/core';
import { AtomList, createProsePlugin, Utils } from '@milkdown/utils';
import { keymap } from 'prosemirror-keymap';
import { AllSelection, TextSelection, Transaction } from 'prosemirror-state';

export type Options = {
    type: 'space' | 'tab';
    size: number;
};

const updateIndent = (tr: Transaction, options: Options): Transaction => {
    const { doc, selection } = tr;

    if (!doc || !selection) return tr;

    if (!(selection instanceof TextSelection || selection instanceof AllSelection)) {
        return tr;
    }

    const { to } = selection;

    const text = options.type === 'space' ? Array(options.size).fill(' ').join('') : '\t';

    return tr.insertText(text, to);
};

const applyStyle = (options: Options, utils: Utils): void => {
    if (options.type === 'tab') {
        const css = injectGlobal;
        utils.getStyle(
            () => css`
                .milkdown {
                    tab-size: ${options.size};
                }
            `,
        );
    }
};

export const Indent = createCmdKey<boolean>();

export const indentPlugin = createProsePlugin<Options>((options, utils) => {
    const config: Options = {
        type: 'tab',
        size: 4,
        ...(options ?? {}),
    };

    applyStyle(config, utils);

    const plugin = keymap({
        Tab: (state, dispatch) => {
            const { tr } = state;
            const _tr = updateIndent(tr, config);

            if (_tr.docChanged) {
                dispatch?.(_tr);
                return true;
            }

            return false;
        },
    });
    return {
        id: 'indent',
        plugin,
    };
});

export const indent = AtomList.create([indentPlugin()]);
