/* Copyright 2021, Milkdown by Mirone. */

import { createCmdKey } from '@milkdown/core';
import { keymap } from '@milkdown/prose/keymap';
import { AllSelection, TextSelection, Transaction } from '@milkdown/prose/state';
import { AtomList, createPlugin, Utils } from '@milkdown/utils';

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
        utils.getStyle(
            ({ injectGlobal }) => injectGlobal`
                .milkdown {
                    tab-size: ${options.size};
                }
            `,
        );
    }
};

export const Indent = createCmdKey<boolean>('Indent');

export const indentPlugin = createPlugin<string, Options>((utils, options) => ({
    prosePlugins: () => {
        const config: Options = {
            type: 'tab',
            size: 4,
            ...(options ?? {}),
        };

        utils.themeManager.onFlush(() => {
            applyStyle(config, utils);
        });

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
        return [plugin];
    },
}));

export const indent = AtomList.create([indentPlugin()]);
