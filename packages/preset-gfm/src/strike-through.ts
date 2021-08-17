import { createCmdKey, createCmd } from '@milkdown/core';
import { css } from '@emotion/css';
import { createMark, markRule } from '@milkdown/utils';
import { createShortcut } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import { SupportedKeys } from './supported-keys';

type Keys = SupportedKeys['StrikeThrough'];

export const ToggleStrikeThrough = createCmdKey();

export const strikeThrough = createMark<Keys>((options, utils) => {
    const id = 'strike_through';
    const style = options?.headless
        ? null
        : css`
              text-decoration-color: ${utils.themeTool.palette('secondary')};
          `;

    return {
        id,
        schema: {
            parseDOM: [
                { tag: 'del' },
                { style: 'text-decoration', getAttrs: (value) => (value === 'line-through') as false },
            ],
            toDOM: (mark) => ['del', { class: utils.getClassName(mark.attrs, 'strike-through', style) }],
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
        commands: (markType) => [createCmd(ToggleStrikeThrough, () => toggleMark(markType))],
        shortcuts: {
            [SupportedKeys.StrikeThrough]: createShortcut(ToggleStrikeThrough, 'Mod-Alt-x'),
        },
    };
});
