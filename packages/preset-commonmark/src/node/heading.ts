import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { BaseNode } from '@milkdown/utils';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';

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

export class Heading extends BaseNode<Keys> {
    id = 'heading';
    schema: NodeSpec = {
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
            { class: this.getClassName(node.attrs, `heading h${node.attrs.level}`) },
            0,
        ],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === this.id,
        runner: (state, node, type) => {
            const depth = node.depth as number;
            state.openNode(type, { level: depth });
            state.next(node.children);
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('heading', undefined, { depth: node.attrs.level });
            state.next(node.content);
            state.closeNode();
        },
    };
    override inputRules = (nodeType: NodeType) =>
        headingIndex.map((x) =>
            textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), nodeType, () => ({
                level: x,
            })),
        );
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
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
    });
}
