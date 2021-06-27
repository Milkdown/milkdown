import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, SerializerNode } from '@milkdown/core';
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
        runner: (type, state, node) => {
            const depth = node.depth as number;
            state.stack.openNode(type, { level: depth });
            state.next(node.children);
            state.stack.closeNode();
        },
    };
    serializer: SerializerNode = (state, node) => {
        state.write(`${state.utils.repeat('#', node.attrs.level)} `);
        state.renderInline(node);
        state.closeBlock(node);
    };
    override inputRules = (nodeType: NodeType) =>
        headingIndex.map((x) =>
            textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), nodeType, () => ({
                level: x,
            })),
        );
}
