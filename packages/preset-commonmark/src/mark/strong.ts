import { createCommand } from '@milkdown/core';
import { createMark, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['Bold'];
const id = 'strong';
export const ToggleBold = createCommand();
export const strong = createMark<Keys>((_, utils) => ({
    id,
    schema: {
        parseDOM: [
            { tag: 'b' },
            { tag: 'strong' },
            { style: 'font-style', getAttrs: (value) => (value === 'bold') as false },
        ],
        toDOM: (mark) => ['strong', { class: utils.getClassName(mark.attrs, id) }],
    },
    parser: {
        match: (node) => node.type === 'strong',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.next(node.children);
            state.closeMark(markType);
        },
    },
    serializer: {
        match: (mark) => mark.type.name === id,
        runner: (state, mark) => {
            state.withMark(mark, 'strong');
        },
    },
    inputRules: (markType) => [
        markRule(/(?:__)([^_]+)(?:__)$/, markType),
        markRule(/(?:\*\*)([^*]+)(?:\*\*)$/, markType),
    ],
    commands: (markType) => [[ToggleBold, toggleMark(markType)]],
    shortcuts: {
        [SupportedKeys.Bold]: {
            defaultKey: 'Mod-b',
            commandKey: ToggleBold,
        },
    },
}));
