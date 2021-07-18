import { createNode } from '@milkdown/utils';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { SupportedKeys } from '../supported-keys';

type Keys = SupportedKeys['CodeFence'];

const id = 'fence';
export const codeFence = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        content: 'text*',
        group: 'block',
        marks: '',
        defining: true,
        code: true,
        attrs: {
            language: {
                default: '',
            },
        },
        parseDOM: [
            {
                tag: 'pre',
                preserveWhitespace: 'full',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error('Parse DOM error.');
                    }
                    return { language: dom.dataset.language };
                },
            },
        ],
        toDOM: (node) => {
            return [
                'div',
                {
                    class: utils.getClassName(node.attrs, 'code-fence'),
                },
                ['pre', ['code', { spellCheck: 'false' }, 0]],
            ];
        },
    },
    parser: {
        match: ({ type }) => type === 'code',
        runner: (state, node, type) => {
            const lang = node.lang as string;
            const value = node.value as string;
            state.openNode(type, { language: lang });
            state.addText(value);
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: node.attrs.language });
        },
    },
    inputRules: (nodeType) => [textblockTypeInputRule(/^```$/, nodeType)],
    commands: (nodeType) => ({
        [SupportedKeys.CodeFence]: {
            defaultKey: 'Mod-Alt-c',
            command: setBlockType(nodeType),
        },
    }),
}));
