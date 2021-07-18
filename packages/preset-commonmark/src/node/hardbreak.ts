import { createNode } from '@milkdown/utils';
import { SupportedKeys } from '..';

type Keys = SupportedKeys['HardBreak'];

const id = 'hardbreak';
export const hardbreak = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: (node) => ['br', { class: utils.getClassName(node.attrs, id) }],
    },
    parser: {
        match: ({ type }) => type === 'break',
        runner: (state, _, type) => {
            state.addNode(type);
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state) => {
            state.addNode('break');
        },
    },
    commands: (nodeType) => ({
        [SupportedKeys.HardBreak]: {
            defaultKey: 'Shift-Enter',
            command: (state, dispatch) => {
                dispatch?.(state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView());
                return true;
            },
        },
    }),
}));
