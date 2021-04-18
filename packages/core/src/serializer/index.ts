import type { Node } from 'prosemirror-model';
import type { MarkMap, NodeMap } from './types';

import { State } from './state';

export function createSerializer(nodes: NodeMap, marks: MarkMap) {
    return (content: Node) => {
        const state = new State(nodes, marks);
        state.renderContent(content);
        return state.output;
    };
}

export * from './types';
