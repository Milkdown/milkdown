import { createCommand } from '@milkdown/core';
import { createMark, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import { SupportedKeys } from '.';

type Keys = SupportedKeys['StrikeThrough'];

export const ToggleStrikeThrough = createCommand();

export const strikeThrough = createMark<Keys>((_, utils) => {
    const id = 'strike_through';

    return {
        id,
        schema: {
            parseDOM: [
                { tag: 'del' },
                { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
            ],
            toDOM: (mark) => ['del', { class: utils.getClassName(mark.attrs, 'strike-through') }],
        },
        parser: {
            match: (node) => node.type === 'delete',
            runner: (state, node, markType) => {
                state.openMark(markType);
                state.next(node.children);
                state.closeMark(markType);
            },
        },
        serializer: {
            match: (mark) => mark.type.name === id,
            runner: (state, mark) => {
                state.withMark(mark, 'delete');
            },
        },
        inputRules: (markType) => [
            markRule(/(?:~~)([^~]+)(?:~~)$/, markType),
            markRule(/(?:^|[^~])(~([^~]+)~)$/, markType),
        ],
        commands: (markType) => [[ToggleStrikeThrough, toggleMark(markType)]],
        shortcuts: {
            [SupportedKeys.StrikeThrough]: {
                defaultKey: 'Mod-Alt-x',
                commandKey: ToggleStrikeThrough,
            },
        },
    };
});
