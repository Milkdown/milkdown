import type { NodeSpec, NodeType } from 'prosemirror-model';

import { SerializerNode, Node } from '@milkdown/core';
import { InputRule } from 'prosemirror-inputrules';

export class Hr extends Node {
    id = 'hr';
    schema: NodeSpec = {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: () => ['hr', { class: 'hr' }],
    };
    parser = {
        block: this.id,
        isAtom: true,
    };
    serializer: SerializerNode = (state, node) => {
        state.write('---');
        state.closeBlock(node);
    };
    inputRules = (nodeType: NodeType) => [
        new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
            const { tr } = state;

            if (match[0]) {
                tr.replaceWith(start, end, nodeType.create({}));
            }

            return tr;
        }),
    ];
}
