/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, schemaCtx } from '@milkdown/core';
import { InputRule } from '@milkdown/prose/inputrules';
import { Selection } from '@milkdown/prose/state';
import { createNode } from '@milkdown/utils';

const id = 'hr';
export const InsertHr = createCmdKey<string>('InsertHr');
export const hr = createNode((utils) => {
    return {
        id,
        schema: () => ({
            group: 'block',
            parseDOM: [{ tag: 'hr' }],
            toDOM: (node) => ['hr', { class: utils.getClassName(node.attrs, id) }],
            parseMarkdown: {
                match: ({ type }) => type === 'thematicBreak',
                runner: (state, _, type) => {
                    state.addNode(type);
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state) => {
                    state.addNode('thematicBreak');
                },
            },
        }),
        inputRules: (type) => [
            new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
                const { tr } = state;

                if (match[0]) {
                    tr.replaceWith(start - 1, end, type.create());
                }

                return tr;
            }),
        ],
        commands: (type, ctx) => [
            createCmd(InsertHr, () => (state, dispatch) => {
                if (!dispatch) return true;

                const paragraph = ctx.get(schemaCtx).node('paragraph');
                const { tr, selection } = state;
                const { from } = selection;
                const node = type.create();
                if (!node) {
                    return true;
                }
                const _tr = tr.replaceSelectionWith(node).insert(from, paragraph);
                const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true);
                if (!sel) {
                    return true;
                }
                dispatch(_tr.setSelection(sel).scrollIntoView());
                return true;
            }),
        ],
    };
});
