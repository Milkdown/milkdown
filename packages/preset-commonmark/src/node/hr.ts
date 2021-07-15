import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { InputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { BaseNode } from '@milkdown/utils';

export class Hr extends BaseNode {
    override readonly id = 'hr';
    override readonly schema: NodeSpec = {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: (node) => ['hr', { class: this.getClassName(node.attrs) }],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'thematicBreak',
        runner: (state, _, type) => {
            state.addNode(type);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state) => {
            state.addNode('thematicBreak');
        },
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
