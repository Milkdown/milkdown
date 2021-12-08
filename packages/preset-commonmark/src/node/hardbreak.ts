/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { AddMarkStep, Plugin, PluginKey, ReplaceStep } from '@milkdown/prose';
import { createNode, createShortcut } from '@milkdown/utils';

import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['HardBreak'];

export const InsertHardbreak = createCmdKey();

export const hardbreak = createNode<Keys>((utils) => {
    return {
        id: 'hardbreak',
        schema: () => ({
            inline: true,
            group: 'inline',
            selectable: false,
            parseDOM: [{ tag: 'br' }],
            toDOM: (node) => ['br', { class: utils.getClassName(node.attrs, 'hardbreak') }],
            parseMarkdown: {
                match: ({ type }) => type === 'break',
                runner: (state, _, type) => {
                    state.addNode(type);
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === 'hardbreak',
                runner: (state) => {
                    state.addNode('break');
                },
            },
        }),
        commands: (type) => [
            createCmd(InsertHardbreak, () => (state, dispatch) => {
                dispatch?.(state.tr.setMeta('hardbreak', true).replaceSelectionWith(type.create()).scrollIntoView());
                return true;
            }),
        ],
        shortcuts: {
            [SupportedKeys.HardBreak]: createShortcut(InsertHardbreak, 'Shift-Enter'),
        },
        prosePlugins: (type) => [
            new Plugin({
                key: new PluginKey('hardbreak-marks'),
                appendTransaction: (trs, _oldState, newState) => {
                    if (!trs.length) return;
                    const [tr] = trs;

                    const [step] = tr.steps;

                    const isInsertHr = tr.getMeta('hardbreak');
                    if (isInsertHr) {
                        if (!(step instanceof ReplaceStep)) {
                            return;
                        }
                        const { from } = step as unknown as { from: number };
                        return newState.tr.setNodeMarkup(from, type, undefined, []);
                    }

                    const isAddMarkStep = step instanceof AddMarkStep;
                    if (isAddMarkStep) {
                        let _tr = newState.tr;
                        const { from, to } = step as unknown as { from: number; to: number };
                        newState.doc.nodesBetween(from, to, (node, pos) => {
                            if (node.type === type) {
                                _tr = _tr.setNodeMarkup(pos, type, undefined, []);
                            }
                        });

                        return _tr;
                    }

                    return;
                },
            }),
        ],
    };
});
