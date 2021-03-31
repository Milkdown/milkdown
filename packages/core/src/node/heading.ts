import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { ParserSpec } from '../parser/types';
import type { SerializerNode } from '../serializer/types';

import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Node } from '../abstract/node';

const headingIndex = Array(5)
    .fill(0)
    .map((_, i) => i + 1);

export class Heading extends Node {
    name = 'heading';
    schema: NodeSpec = {
        content: 'text*',
        group: 'block',
        attrs: {
            level: {
                default: 1,
            },
        },
        parseDOM: headingIndex.map((x) => ({ tag: `h${x}`, attrs: { level: x } })),
        toDOM: (node) => [`h${node.attrs.level}`, { class: `h${node.attrs.level}` }, 0],
    };
    parser: ParserSpec = {
        block: this.name,
        getAttrs: (tok) => ({ level: Number(tok.tag.slice(1)) }),
    };
    serializer: SerializerNode = (state, node) => {
        state.write(`${state.utils.repeat('#', node.attrs.level)} `);
        state.renderInline(node);
        state.closeBlock(node);
    };
    inputRules = (nodeType: NodeType) =>
        headingIndex.map((x) =>
            textblockTypeInputRule(new RegExp(`^(#{1,${x}})\\s$`), nodeType, () => ({
                level: x,
            })),
        );
}
