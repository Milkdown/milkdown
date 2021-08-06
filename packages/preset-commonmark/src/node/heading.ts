import { createNode } from '@milkdown/utils';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { setBlockType } from 'prosemirror-commands';
import { SupportedKeys } from '..';
import { createCommand } from '@milkdown/core';

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

export const TurnIntoH1 = createCommand();
export const TurnIntoH2 = createCommand();
export const TurnIntoH3 = createCommand();
export const TurnIntoH4 = createCommand();
export const TurnIntoH5 = createCommand();
export const TurnIntoH6 = createCommand();

export const heading = createNode<Keys>((_, utils) => ({
    id,
    schema: {
        content: 'inline*',
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
    commands: (nodeType) => [
        [TurnIntoH1, setBlockType(nodeType, { level: 1 })],
        [TurnIntoH2, setBlockType(nodeType, { level: 2 })],
        [TurnIntoH3, setBlockType(nodeType, { level: 3 })],
        [TurnIntoH4, setBlockType(nodeType, { level: 4 })],
        [TurnIntoH5, setBlockType(nodeType, { level: 5 })],
        [TurnIntoH6, setBlockType(nodeType, { level: 6 })],
    ],

    shortcuts: {
        [SupportedKeys.H1]: {
            defaultKey: 'Mod-Alt-1',
            commandKey: TurnIntoH1,
        },
        [SupportedKeys.H2]: {
            defaultKey: 'Mod-Alt-2',
            commandKey: TurnIntoH2,
        },
        [SupportedKeys.H3]: {
            defaultKey: 'Mod-Alt-3',
            commandKey: TurnIntoH3,
        },
        [SupportedKeys.H4]: {
            defaultKey: 'Mod-Alt-4',
            commandKey: TurnIntoH4,
        },
        [SupportedKeys.H5]: {
            defaultKey: 'Mod-Alt-5',
            commandKey: TurnIntoH5,
        },
        [SupportedKeys.H6]: {
            defaultKey: 'Mod-Alt-6',
            commandKey: TurnIntoH6,
        },
    },
}));
