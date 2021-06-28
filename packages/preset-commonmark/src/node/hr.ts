import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { NodeParserSpec, SerializerNode } from '@milkdown/core';

import { InputRule } from 'prosemirror-inputrules';
import { CommonNode } from '../utility';

export class Hr extends CommonNode {
    override readonly id = 'hr';
    override readonly schema: NodeSpec = {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: (node) => ['hr', { class: this.getClassName(node.attrs) }],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'thematicBreak',
        runner: (type, state) => {
            state.addNode(type);
        },
    };
    override readonly serializer: SerializerNode = (state, node) => {
        state.write('---');
        state.closeBlock(node);
    };
    override readonly inputRules = (nodeType: NodeType) => [
        new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
            const { tr } = state;

            if (match[0]) {
                tr.replaceWith(start, end, nodeType.create({}));
            }

            return tr;
        }),
    ];
}
