import { createNode } from '@milkdown/utils';
import { InputRule } from 'prosemirror-inputrules';

const id = 'hr';
export const hr = createNode((_, utils) => ({
    id,
    schema: {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: (node) => ['hr', { class: utils.getClassName(node.attrs, id) }],
    },
    parser: {
        match: ({ type }) => type === 'thematicBreak',
        runner: (state, _, type) => {
            state.addNode(type);
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state) => {
            state.addNode('thematicBreak');
        },
    },
    inputRules: (nodeType) => [
        new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
            const { tr } = state;

            if (match[0]) {
                tr.replaceWith(start, end, nodeType.create({}));
            }

            return tr;
        }),
    ],
}));
