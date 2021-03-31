import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { SerializerNode } from '../serializer/types';

import { InputRule } from 'prosemirror-inputrules';
import { Node } from '../abstract/node';

export class Hr extends Node {
    name = 'hr';
    schema: NodeSpec = {
        group: 'block',
        parseDOM: [{ tag: 'hr' }],
        toDOM: () => ['hr', { class: 'hr' }],
    };
    parser = {
        block: this.name,
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
