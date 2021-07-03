import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { CommonNode } from '../utility/base';

const headingIndex = Array(5)
    .fill(0)
    .map((_, i) => i + 1);

export class Heading extends CommonNode {
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
}
