import { createNode } from '@milkdown/utils';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { setBlockType } from 'prosemirror-commands';
import { SupportedKeys } from '..';

const headingIndex = Array(5)
    .fill(0)
    .map((_, i) => i + 1);

type Keys =
    | SupportedKeys['H1']
    | SupportedKeys['H2']
    | SupportedKeys['H3']
    | SupportedKeys['H4']
    | SupportedKeys['H5']
    | SupportedKeys['H6'];

const id = 'heading';
export const heading = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        content: 'text*',
        group: 'block',
        attrs: {
            level: {
                default: 1,
            },
        },
        parseDOM: headingIndex.map((x) => ({ tag: `h${x}`, attrs: { level: x } })),
        toDOM: (node) => [
            `h${node.attrs.level}`,
            { class: utils.getClassName(node.attrs, `heading h${node.attrs.level}`) },
            0,
        ],
    },
    parser: {
        match: ({ type }) => type === id,
        runner: (state, node, type) => {
            const depth = node.depth as number;
            state.openNode(type, { level: depth });
            state.next(node.children);
            state.closeNode();
        },
    },
    serializer: {
        match: (node) => node.type.name === id,
        runner: (state, node) => {
            state.openNode('heading', undefined, { depth: node.attrs.level });
            state.next(node.content);
            state.closeNode();
        },
    },
    inputRules: (nodeType) =>
        headingIndex.map((x) =>
            textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), nodeType, () => ({
                level: x,
            })),
        ),
    commands: (nodeType) => ({
        [SupportedKeys.H1]: {
            defaultKey: 'Mod-Alt-1',
            command: setBlockType(nodeType, { level: 1 }),
        },
        [SupportedKeys.H2]: {
            defaultKey: 'Mod-Alt-2',
            command: setBlockType(nodeType, { level: 2 }),
        },
        [SupportedKeys.H3]: {
            defaultKey: 'Mod-Alt-3',
            command: setBlockType(nodeType, { level: 3 }),
        },
        [SupportedKeys.H4]: {
            defaultKey: 'Mod-Alt-4',
            command: setBlockType(nodeType, { level: 4 }),
        },
        [SupportedKeys.H5]: {
            defaultKey: 'Mod-Alt-5',
            command: setBlockType(nodeType, { level: 5 }),
        },
        [SupportedKeys.H6]: {
            defaultKey: 'Mod-Alt-6',
            command: setBlockType(nodeType, { level: 6 }),
        },
    }),
}));
