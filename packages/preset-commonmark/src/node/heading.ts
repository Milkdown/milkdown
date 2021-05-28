import type { NodeSpec, NodeType } from 'prosemirror-model';
import { ParserSpec, SerializerNode, Node } from '@milkdown/core';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

const headingIndex = Array(5)
    .fill(0)
    .map((_, i) => i + 1);

export class Heading extends Node {
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
        toDOM: (node) => [`h${node.attrs.level}`, { class: `heading h${node.attrs.level}` }, 0],
    };
    parser: ParserSpec = {
        block: this.id,
        getAttrs: (tok) => ({ level: Number(tok.tag.slice(1)) }),
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
