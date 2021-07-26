import { createMark, markRule } from '@milkdown/utils';
import { toggleMark } from 'prosemirror-commands';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['CodeInline'];
const id = 'code_inline';

export const codeInline = createMark<Keys>((_, utils) => ({
    id,
    schema: {
        excludes: '_',
        parseDOM: [{ tag: 'code' }],
        toDOM: (mark) => ['code', { class: utils.getClassName(mark.attrs, 'code-inline') }],
    },
    parser: {
        match: (node) => node.type === 'inlineCode',
        runner: (state, node, markType) => {
            state.openMark(markType);
            state.addText(node.value as string);
            state.closeMark(markType);
        },
    },
    serializer: {
        match: (mark) => mark.type.name === id,
        runner: (state, _, node) => {
            state.addNode('inlineCode', undefined, node.text || '');

            return true;
        },
    },
    inputRules: (markType) => [markRule(/(?:^|[^`])(`([^`]+)`)$/, markType)],
    commands: (markType) => ({
        [SupportedKeys.CodeInline]: {
            defaultKey: 'Mod-e',
            command: toggleMark(markType),
        },
    }),
}));
